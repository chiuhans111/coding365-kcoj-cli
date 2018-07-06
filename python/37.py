c = int(input())
papa = []
for i in range(c):
    papa.append([None, 0])

for i in range(c-1):
    [a, b] = input().split(' ')
    papa[int(b)][0] = int(a)

for i in range(c-1):
    for j in range(i+1, c):
        for k in range(c):
            papa[k][1] = 0

        p = i
        l = 0
        while p != None:
            papa[p][1] = l
            p = papa[p][0]
            l = l+1

        # print(papa)

        p = j
        l = 0
        while p != None:
            # print(p)
            if p == i:
                print('{0}-{1}-{2}'.format(i, j, l))
                break
            if papa[p][1] != 0:
                print('{0}-{1}-{2}'.format(i, j, papa[p][1]+l))
                break
            p = papa[p][0]
            l = l+1
