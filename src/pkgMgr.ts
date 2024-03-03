#! /usr/bin/env node
import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { js2xml, xml2js } from 'xml-js';
import yargs, { ArgumentsCamelCase } from "yargs";
import { hideBin } from "yargs/helpers";
import { OFS } from "./OFS";




var myOFS: OFS;
const argv = yargs(hideBin(process.argv))
argv.scriptName("ofscplugin")
    .usage('$0 <cmd> [args]')
    .command(
        'upload [label]',
        'Upload pluin to cloud',
        (yargs) => {
            yargs.positional('label', {
                type: 'string',
                default: '',
                describe: 'label of plugin'
            }),
                yargs.positional('credentials', {
                    type: 'string',
                    default: 'credentials.json',
                    describe: 'label of credentials file'
                }),
                yargs.positional('propertiesFile', {
                    type: 'string',
                    default: 'plugin.xml',
                    describe: 'plugin.xml'
                }),
                yargs.positional('filename', {
                    type: 'string',
                    default: 'plugin.zip',
                    describe: 'plugin zip file'
                })
        },
        async (argv: ArgumentsCamelCase<any>): Promise<void> => {

            
            // credentials
            if (existsSync(argv.credentials)) {
                myOFS = new OFS(
                    JSON.parse(readFileSync(argv.credentials).toString())
                );
                console.error(
                    `Credentials file ${argv.credentials} is found.`
                );

            } else {
                console.error(
                    `Credentials file ${argv.credentials} is not found.`
                );
                process.exit(1);
            }

            // upload plugin file
            if (existsSync(argv.propertiesFile)) {
                
                var xml = readFileSync('plugin.xml', 'utf8');
                var options = { ignoreComment: true, alwaysChildren: true };
                var result:any = xml2js(xml, options); 
                

                // read plugin zip data
                console.log("Current directory2:", __dirname);
                var pluginZip = readFileSync('build/plugin.zip');
                var hash = createHash("sha256");
                hash.update(pluginZip);   
                // update plugin xml             
                result.elements[0].elements.filter((e:any)=> e.name=="plugins")[0].elements[0].elements.filter((e:any)=> e.name=="plugin_data")[0].elements[0].elements[0].attributes.content_hash = hash.digest("hex");
                result.elements[0].elements.filter((e:any)=> e.name=="plugins")[0].elements[0].elements.filter((e:any)=> e.name=="plugin_data")[0].elements[0].elements[0].elements[0].elements[0].cdata =pluginZip.toString("base64");

                // update plugin.xml
                var t = js2xml(result, {  spaces: 4 });
                writeFileSync("plugin.xml", t);
                
                myOFS.importPlugins("plugin.xml").then((result:any) => {
                    console.error(result.status);
                    if (result.status == 204) {
                        console.error("Upload OK");
                    } else {
                        console.error(JSON.stringify(result));
                        
                    }
                });
            } else {
                console.error(
                    `plugin.xml file  is not found.`
                );
                process.exit(1);
            }

           
        })
    .help()
    .argv