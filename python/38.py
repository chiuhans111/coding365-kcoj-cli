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

avaTeacher = teachers.copy()

for i in range(n):
    student = students[i]

    def rank(teacher):
        ti = teachers.index(teacher)

        s1 = data2[ti].index(student)
        s2 = data1[i].index(teacher)
        # print(teacher, student, s1, s2)
        return s1*n+s2
    

    avaTeacher.sort(key=rank)
    print('{0}->{1}'.format(student, avaTeacher.pop(0)))
