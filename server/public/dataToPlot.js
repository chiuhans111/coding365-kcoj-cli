function dataToPlot(content, dateStart) {

    var id = 0
    var minTime = null
    var maxTime = null

    console.log(content)
    series = content.map(x => {
        return {
            yAxis: 0,
            name: `${x.info.id} (${x.info.name})`,
            type: 'spline',
            data: x.content.map((record, i, arr) => {
                if (i != 0 && i < arr.length - 1 && !record.important && !arr[i + 1].important) return null

                var time = new Date(record.time)
                if (minTime == null || time < minTime) minTime = time
                if (maxTime == null || time > maxTime) maxTime = time

                var language = ['?', 'C', 'C♯', 'JAVA', 'Python'][record.course]

                var result = record.result ? record.result.map(x => {
                    var color = x.success ? 'green' : 'red'
                    return `<p style="color:${color}">${x.id} : ${x.content}</p>`
                }).join('<br>') : ''

                var details = ''

                if (record.important ||
                    record.result && record.result.length > 0 && record.important) {
                    if (record.success) details = `作答題號: ${record.problem} <br>` +
                        `使用語言: ${language} <br>` +
                        `${result}`
                }

                return {
                    x: time,
                    y: record.count,
                    record,
                    timeStr: new Date(record.time).toLocaleString(),
                    result,
                    language,
                    details
                }
            }).filter(record => record != null)
        }
    })

    dateStart = minTime
    console.log(dateStart)

    countSpeed = {}
    var range = 1000 * 60 * 60 * 2;

    fullRange = maxTime - minTime
    for (var t = minTime.getTime(); t <= maxTime.getTime(); t += range) {
        var time = Math.round(new Date(t).getTime() / range) * range
        countSpeed[time] = 0

    }

    content.map(x => {
        var lastTime = null
        var last = null
        x.content.map(record => {
            for (i = -1; i <= 1; i++) {
                var time = Math.round(new Date(record.time).getTime() / range + i * 0.5) * range
                if (time != lastTime) {
                    if (countSpeed[time] == null)
                        countSpeed[time] = 0
                    if (record.countAll != last)
                        countSpeed[time] += record.countAll - last
                }
                lastTime = time
            }
            last = record.countAll
        })
    })

    var data2 = []
    for (var i in countSpeed) {
        var time = new Date(+i)
        data2.push({
            x: time,
            y: countSpeed[i],
            timeStr: time.toLocaleString(),
        })
    }

    data2.sort((a, b) => a.x - b.x)
    data2.slice(0, 10).map(x => {
        if (x.y > 10) x.y = 0
    })

    console.log(data2)

    return {
        chart: {
            type: 'spline',
            zoomType: 'xy',
            panKey: 'ctrl',
            backgroundColor: '#f5f5f5',
            animation: true,
        },
        title: { text: '解題歷史資料' },
        subtitle: { text: '自從 ' + dateStart.toLocaleString() },
        xAxis: {
            type: 'datetime',
            title: { text: '時間' }
        },
        yAxis: [{
            title: { text: '題數' },
            min: 0,
            opposite: true
        }, {
            title: { text: '爆肝指數' },
            min: 0,
        }],
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat:
                '<small>{point.timeStr}</small><br>' +
                '累積解題: {point.y} 題 <br>' +
                '總解題數: {point.record.countAll} 題 <br>' +
                '{point.details}'
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (e) {
                            hs.htmlExpand(null, {
                                pageOrigin: {
                                    x: e.pageX || e.clientX,
                                    y: e.pageY || e.clientY
                                },
                                headingText: this.series.name,
                                maincontentText: 'hi',
                                width: 200
                            });
                        }
                    }
                }
            }, areaspline: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                },
                color: '#ccc'
            }
        },
        series: [
            {
                yAxis: 1,
                name: "爆肝指數",
                type: 'areaspline',
                data: data2,
                tooltip: {
                    pointFormat:
                        '<small>{point.timeStr}</small><br>' +
                        '{point.y} 題 <br>'
                }
            },
            ...series,
        ]
    }
}