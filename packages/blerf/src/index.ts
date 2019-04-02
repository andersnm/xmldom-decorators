#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
import * as childProcess from 'child_process';
import { toposort } from './toposort';
const stringifyPackage = require("stringify-package");
const tar = require('tar')

type PackageInfoType = { packagePath: string, packageJson: any};
type PackagesType = {[packageName: string]: PackageInfoType};

const rootPath = "packages";

if (process.argv[2] === "run") {
    run(process.argv.slice(3));
} else if (process.argv[2] === "install") {
    install();
} else if (process.argv[2] === "pack") {
    pack();
}

async function run(argv: string[]): Promise<void> {
    await enumeratePackages(async (packagePath: string, packageJson: any) => {
        if (!packageJson.scripts[argv[0]]) {
            console.log("blerf: Skipping " + packagePath + ". No script '" + argv[0] + "'");
            return;
        }

        childProcess.execSync("npm run " + argv.join(" "), {stdio: 'inherit', cwd: packagePath});
    });
}

async function install(): Promise<void> {
    await enumeratePackages(async (packagePath: string, packageJson: any) => {
        childProcess.execSync("npm install", {stdio: 'inherit', cwd: packagePath}); 
    });
}

async function pack(): Promise<void> {
    await enumeratePackages(async (packagePath: string, packageJson: any, packages: PackagesType) => {
        childProcess.execSync("npm pack", {stdio: 'inherit', cwd: packagePath});

        console.log("blerf: patching project references");

        // NOTE: assuming file name of tarball; can also get it from the output of npm pack
        const sourcePackageTarPath = path.join(packagePath, packageJson.name + "-" + packageJson.version + ".tgz");
        const tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "blerf-"));

        try {
            tar.extract({ file: sourcePackageTarPath, cwd: tempPath, sync: true });
            patchPackageJson(packagePath, path.join(tempPath, "package", "package.json"), packages);
            tar.create({ file: sourcePackageTarPath, cwd: tempPath, gzip: true, sync: true, }, ["package"]);
        } finally {
            rimraf(tempPath);
        }
    });
}

async function enumeratePackages(callback: (packagePath: string, packageJson: any, packages: PackagesType) => Promise<void>) {
    const files = fs.readdirSync(rootPath);

    const packages: PackagesType = {};

    const nodes: string[] = [];
    const edges: [string, string][] = [];

    for (let fileName of files) {
        const packagePath = rootPath + "/" + fileName;
        const ls = fs.lstatSync(packagePath);
        if (!ls.isDirectory()) {
            continue;
        }

        const packageJson = readPackageJson(path.join(packagePath, "package.json"));
        nodes.push(packageJson.name);

        if (packageJson.dependencies) {
            for (let dependencyName of Object.keys(packageJson.dependencies)) {
                const ref = packageJson.dependencies[dependencyName];
                if (ref.startsWith("file:") && nodes.indexOf(dependencyName) !== -1) {
                    edges.push([dependencyName, packageJson.name])
                }
            }
        }

        if (packageJson.devDependencies) {
            for (let dependencyName of Object.keys(packageJson.devDependencies)) {
                const ref = packageJson.devDependencies[dependencyName];
                if (ref.startsWith("file:") && nodes.indexOf(dependencyName) !== -1) {
                    edges.push([dependencyName, packageJson.name])
                }
            }
        }

        packages[packageJson.name] = {
            packageJson: packageJson,
            packagePath: packagePath
        };
    }

    const sorted = toposort(nodes, edges);
    console.log("blerf: project order: " + sorted.join(", "));

    for (let packageName of sorted) {
        const packageInfo = packages[packageName];
        const packageJson = packageInfo.packageJson;
        const packagePath = packageInfo.packagePath;

        try {
            await callback(packagePath, packageJson, packages);
        } catch (e) {
            console.error("blerf: Error executing command in " + packagePath)
            console.error("blerf: ", e);
            console.error("blerf: Resuming in next directory")
        }
    }
}

function updateDependencyVersions(packagePath: string, packageDependencies: any, packages: PackagesType) {
    if (!packageDependencies) {
        return;
    }

    for (let dependencyName of Object.keys(packageDependencies)) {
        const ref = packageDependencies[dependencyName];
        if (!ref.startsWith("file:")) {
            continue;
        }

        const dependencyPackageInfo = packages[dependencyName];
        if (dependencyPackageInfo) {
            packageDependencies[dependencyName] = dependencyPackageInfo.packageJson.version;
        } else {
            // TODO: possibly noop instead?
            throw new Error("Expected file:-based reference to a project under ./packages: " + ref);
        }
    }
}

function patchPackageJson(packagePath: string, packageJsonPath: string, packages: PackagesType) {
    // Resolve all file:-based dependencies to explicit versions
    const packageJson = readPackageJson(packageJsonPath);
    updateDependencyVersions(packagePath, packageJson.dependencies, packages);
    updateDependencyVersions(packagePath, packageJson.devDependencies, packages);
    fs.writeFileSync(packageJsonPath, stringifyPackage(packageJson), 'utf8');
}

function readPackageJson(packageJsonPath: string) {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

/**
 * Remove directory recursively
 * @param {string} dir_path
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimraf(dir_path: string) {
    if (fs.existsSync(dir_path)) {
        fs.readdirSync(dir_path).forEach(function(entry) {
            var entry_path = path.join(dir_path, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                rimraf(entry_path);
            } else {
                fs.unlinkSync(entry_path);
            }
        });
        fs.rmdirSync(dir_path);
    }
}
