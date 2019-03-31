#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
import * as childProcess from 'child_process';
const readJson = require("read-package-json");
const stringifyPackage = require("stringify-package");
const tar = require('tar')

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
    await enumeratePackages(async (packagePath: string, packageJson: any) => {
        childProcess.execSync("npm pack", {stdio: 'inherit', cwd: packagePath});

        console.log("blerf: patching project references");

        // NOTE: assuming file name of tarball; can also get it from the output of npm pack
        const sourcePackageTarPath = path.join(packagePath, packageJson.name + "-" + packageJson.version + ".tgz");
        const tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "blerf-"));

        try {
            tar.extract({ file: sourcePackageTarPath, cwd: tempPath, sync: true });
            await patchPackageJson(packagePath, path.join(tempPath, "package", "package.json"));
            tar.create({ file: sourcePackageTarPath, cwd: tempPath, gzip: true, sync: true, }, ["package"]);
        } finally {
            rimraf(tempPath);
        }
    });
}

async function enumeratePackages(callback: (packagePath: string, packageJson: any) => Promise<void>) {
    const files = fs.readdirSync(rootPath);

    for (let fileName of files) {
        const packagePath = rootPath + "/" + fileName;
        const ls = fs.lstatSync(packagePath);
        if (!ls.isDirectory()) {
            continue;
        }

        const packageJson = await readPackageJson(path.join(packagePath, "package.json"));
        try {
            await callback(packagePath, packageJson);
        } catch (e) {
            console.error("blerf: Error executing command in " + packagePath)
            console.error("blerf: ", e);
            console.error("blerf: Resuming in next directory")
        }
    }
}

async function getPackageVersion(packagePath: string): Promise<string> {
    const packageJson = await readPackageJson(path.join(packagePath, "package.json"));
    return packageJson.version;
}

async function updateDependencyVersions(packagePath: string, packageDependencies: any) {
    if (!packageDependencies) {
        return;
    }

    for (let dependencyName of Object.keys(packageDependencies)) {
        const ref = packageDependencies[dependencyName];
        if (!ref.startsWith("file:")) {
            continue;
        }

        const version = await getPackageVersion(path.join(packagePath, ref.substr(5)));
        packageDependencies[dependencyName] = version;
    }
}

async function patchPackageJson(packagePath: string, packageJsonPath: string) {
    // Resolve all file:-based dependencies to explicit versions
    const packageJson = await readPackageJson(packageJsonPath);
    await updateDependencyVersions(packagePath, packageJson.dependencies);
    await updateDependencyVersions(packagePath, packageJson.devDependencies);
    fs.writeFileSync(packageJsonPath, stringifyPackage(packageJson), 'utf8');
}

async function readPackageJson(packageJsonPath: string) {
    var readJsonPromise = new Promise<any>((resolve, reject) => {
        readJson(packageJsonPath, console.error, true, function (er: any, data: any) {
            if (er) {
                console.error("There was an error reading package.json")
                reject(er);
                return;
            }

            resolve(data);
        });
    })

    return await readJsonPromise;
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
