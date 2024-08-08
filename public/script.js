function selectFloor(element, mapImage) {
    // 모든 floor-item에서 active 클래스 제거
    const floors = document.querySelectorAll('.floor-item');
    floors.forEach(floor => {
        floor.classList.remove('active');
    });
    
    // 클릭한 요소에 active 클래스 추가
    element.classList.add('active');
    
    // 맵 이미지 변경
    const mapImageElement = document.getElementById('mapImage');
    mapImageElement.src = mapImage;
}

function checkAdminCode() {
    const adminCode = document.getElementById('adminCode').value;
    fetch('/check-admin-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: adminCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/admin';
        } else {
            alert('Invalid admin code');
        }
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.menu-item[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

function showNodeData(nodeId) {
    // 초기 데이터 로드 (노드 선택 시 초기화)
    const data = {
        labels: [],
        datasets: [
            {
                label: '온도',
                data: [],
                borderColor: 'red',
                fill: false
            },
            {
                label: 'CO',
                data: [],
                borderColor: 'blue',
                fill: false
            },
            {
                label: '불꽃',
                data: [],
                borderColor: 'yellow',
                fill: false
            }
        ]
    };

    updateChart(data);
}

let sensorChart;

function updateChart(data) {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    if (sensorChart) {
        sensorChart.destroy();
    }
    sensorChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '시간'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: '값'
                    }
                }
            }
        }
    });
}

// 초기 데이터 로드
showNodeData('node1');

// 실시간 데이터 수신
const socket = io();
socket.on('arduinoData', (data) => {
    const node1Data = data.find(node => node.node === 'Node1');
    if (node1Data) {
        const currentTime = new Date().toLocaleTimeString();
        if (sensorChart.data.labels.length > 10) { // 최근 10개의 데이터만 유지
            sensorChart.data.labels.shift();
            sensorChart.data.datasets.forEach(dataset => dataset.data.shift());
        }
        sensorChart.data.labels.push(currentTime);
        sensorChart.data.datasets[0].data.push(node1Data.temperature);
        sensorChart.data.datasets[1].data.push(node1Data.gas);
        sensorChart.data.datasets[2].data.push(node1Data.flame);
        sensorChart.update();
    }
});
