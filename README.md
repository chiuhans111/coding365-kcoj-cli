# KCOJ - coding 365
This is a simple _command line interface_ to help you finnish your programming homework, 

so you don't have to worried about using _THE_ `Difficult To Use` website.

## Prerequisites
* `Node.js` installed ( if you want to build by yourself )
  - `npm install pkg` ( this is use to build binarys )
* `Python` installed  ( to support local code checks )
## Installing
### Using Binary
1. download at releases
2. run in commandline
3. [Getting Started!](./#Getting_Started)
### Manualy Install and Build
1. install node modules
```
cd coding365-kcoj-cli
npm install
```
2. link to global
```
npm link
```
3. config your `secret key`
file: `./bot/config/key.js`
```
exports.key = 'your secret key can be any string you want!'
```
4. run / build
```
node app.js
npm run build
```
## Getting Started
### First Time Login
```
kcoj
```
and input your username and password, 
`config.json` will store at the folder where you execute the command,
you can change more things there

### Help menu
```
kcoj -h
```
### Initialize a homework
```
cd MyHomeworkFolder
kcoj init HomeworkId
```
example :
```
cd ./python
kcoj init 012
```
this will create a file `012.py` in `/python` folder,
with some extra information commented in the file.
### Test your homework locally
```
kcoj -i FileName.py -t
```
`FileName` is better to be your homework ID, ex:`123.py`
or you should put homework id in Python file:
``` python
# HWID: 123
name = input()
print('Hello '+name)
```
result: 
- AC : all correct
- WA : wrong answer
- TLE : time limit exceeded
- ERR : some error from python
### Delete and Submit your homework to server
```
kcoj -i `FileName.py` -d -p --desc "descriptions"
```
you should see something like
```
XXXXXXXXX所上傳XXX檔案:
檔案名稱: XXX.py 檔案型態: text/plain
檔案敘述: XXX
```
### See the result come from server
```
kcoj -i FileName.py -o
```
### Really useful command combination: Delete Push Output and Auto wait
```
kcoj -i FileName.py -dpoa
```
### See all your homework
```
kcoj -l --detail
```



THANKS
