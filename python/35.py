s = []
y = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}
l = input()
b = 0
s1 = ''
for c in l:

    if c == '(':
        b += 1
    elif c == ')':
        b -= 1
    elif c in y:
        prio = y[c]+b*4
        while len(s) > 0 and s[-1][1] >= prio:
            s1+=s.pop()[0]
        s.append((c, prio))
    else:
        s1+=c

while len(s) > 0:
    s1+=s.pop()[0]

print(s1)