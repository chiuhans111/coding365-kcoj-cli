l = []

s = input()
    
while True:

    c = input().split(' ')
    if c[0] == '1':
        if len(l)<5:
            l += c[1:2]
        elif s[0]=='1':
            print('FULL')
            break
        if s[0]=='2' and len(l)==5:
            print('FULL')
            break
    
    elif c[0] == '2':
        if len(l) == 0:
            print('EMPTY')
            break
        elif s[0]=='1':
            l.pop()
        else:
            l.pop(0)
    
    elif c[0] == '3':
        print(*l)
        break


