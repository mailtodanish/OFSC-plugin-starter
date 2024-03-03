build:
	tsc

dist-clean:
	-@rm -rf build/
	-@rm -rf dist/
	-@mkdir dist
	-@mkdir build
	@cp index.html dist/

pack: dist-clean
	webpack --mode=production

dev-pack: dist-clean
	webpack --mode=development

zip: pack  dev-pack
	cd dist; zip plugin.zip index.html main.js

dev-zip: dev-pack
	cd dist; zip plugin.zip index.html main.js;  
	@cp dist/plugin.zip build/

push:   
		git add .
		git commit -m "updated"
		git push -u origin main

upload: dist-clean dev-zip
	tsc src/pkgMgr.ts --outDir build --module commonjs
	chmod +x ./build/pkgMgr.js
	chmod +x ./build/plugin.zip
	@cp plugin.xml build/
	@cp credentials.json build/
	./build/pkgMgr.js upload