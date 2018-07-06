[c, p] = map(lambda x: int(x), input().split(','))
path = {}

for i in range(p):
    [a, b, l] = input().split(',')
    path[a+','+b] = int(l)
    path[b+','+a] = int(l)

q = [([1], 0)]
m = None
while len(q) > 0:
    now = q.pop()
    if len(now[0]) == c:
        if m == None or now[1] < m:
            m = now[1]
    elif m != None and now[1] >= m:
         pass
    else:
        for i in range(1, c+1):
            if not i in now[0]:
                key = str(i)+','+str(now[0][-1])
                if key in path:
                    q.append((now[0]+[i], now[1]+path[key]))
    # print(q)


print(m)