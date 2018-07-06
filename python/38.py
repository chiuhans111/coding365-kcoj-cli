data = []
n = 2

while True:
    l = input().split(',')
    data.append(l)
    n=len(l)
    if len(data)==n*2:
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
    def rank(teacher):
        ti = teachers.index(teacher)
        return data2[ti].index(student)*n + data1[i].index(teacher)

    student = students[i]
    avaTeacher.sort(key=rank)
    print('{0}->{1}'.format(student, avaTeacher.pop()))
