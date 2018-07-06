data = []
n = 2

while True:
    l = input().split(',')
    data.append(l)
    n = len(l)
    if len(data) == n*2:
        break


data1 = data[0:n]
data2 = data[n:]

# print(data1)
# print(data2)

teachers = sorted(data1[0])
students = sorted(data2[0])

# print(teachers)
# print(students)
remain = teachers.copy()


def rank1(teacher, student):
    si = students.index(student)
    s1 = data1[si].index(teacher)
    return s1


def rank2(teacher, student):
    ti = teachers.index(teacher)
    s2 = data2[ti].index(student)
    return s2


studentChoice = {}

limit = 0

while remain:
    # print(remain)
    
    for i in range(len(remain)):
        teacher = remain.pop(0)
        rank = [(student, rank1(teacher, student))
                for student in students if not student in studentChoice]
        rank.sort(key=lambda r: r[1])
        # print(teacher, rank,limit)
        if rank[0][1] > limit//2:
            remain.append(teacher)
        elif len(rank) == 1 or rank[0][1] < rank[1][1] and limit % 2 == 0:
            studentChoice[rank[0][0]] = teacher

        elif rank[0][1] <= limit//2 and limit % 2 == 1:
            fr = rank[0][1]

            rank2 = [r[0] for r in rank if r[1]==fr and not r[0] in studentChoice]
            rank2.sort(key=lambda student: data2[teachers.index(teacher)].index(student))
            # print(teacher, rank2)
            studentChoice[rank2[0]] = teacher

        else:
            remain.append(teacher)

    limit += 1
    # print(studentChoice)


for student in students:
    print('{0}->{1}'.format(student, studentChoice[student]))
