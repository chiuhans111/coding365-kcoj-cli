# KCOJ - coding 365
This is a simple _command line interface_ to help you finnish your programming homework, 

so you don't have to worried about using _THE_ `Difficult To Use` website.

### Prerequisites
* `Node.js` installed
* `Python` installed
### Installing
1. install node modules
```
cd coding365
npm install
```
2. link to global
```
npm link
```
3. config your `username` and `password`

see `./bot/config/private.js.example`


## Getting Started
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
kcoj -i `FileName.py` -t
```
`FileName` is better to be your homework ID, ex:`012.py`
or you should put homework id in Python file:
``` python
# HWID: `HomeworkId`
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
kcoj -i `FileName.py` -o
```
