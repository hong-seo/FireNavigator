document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // ���� �⺻ ���� ������ ����

    const userName = document.querySelector('input[name="userName"]').value;

    if (userName === "1234") {
      // admin.html �������� �� â���� ���ϴ�.
      const adminWindow = window.open("admin.html", "_blank");

      // �� â�� ���������� ������ ���� â�� �ݽ��ϴ�.
      if (adminWindow) {
        window.close();
      } else {
        alert("�˾��� ���ܵǾ����ϴ�. �˾� ������ �����ϰ� �ٽ� �õ����ּ���.");
      }
    } else {
      alert("�߸��� ������ ��ȣ�Դϴ�.");
    }
  });
//�˾�â ���� �ڵ�
document.getElementById("info").addEventListener("click", function () {
  document.querySelector(".login-wrapper").classList.toggle("active");
});

//�˾�â �ݴ� �ڵ�
document.querySelector(".close-btn").addEventListener("click", function () {
  document.querySelector(".login-wrapper").classList.remove("active");
});

function selectFloor(element, mapImage) {
  // 모든 floor-item?��?�� active ?��?��?�� ?���?
  const floors = document.querySelectorAll(".floor-item");
  floors.forEach((floor) => {
    floor.classList.remove("active");
  });

  // ?���??�� ?��?��?�� active ?��?��?�� 추�??
  element.classList.add("active");

  // �? ?��미�?? �?�?
  const mapImageElement = document.getElementById("mapImage");
  mapImageElement.src = mapImage;
}

function checkAdminCode() {
  const adminCode = document.getElementById("adminCode").value;
  fetch("/check-admin-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: adminCode }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = "/admin";
      } else {
        alert("Invalid admin code");
      }
    });
}

function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");

  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.classList.remove("active");
  });
  document
    .querySelector(`.menu-item[onclick="showSection('${sectionId}')"]`)
    .classList.add("active");
}

function showNodeData(nodeId) {
  // 초기 ?��?��?�� 로드 (?��?�� ?��?�� ?�� 초기?��)
  const data = {
    labels: [],
    datasets: [
      {
        label: "?��?��",
        data: [],
        borderColor: "red",
        fill: false,
      },
      {
        label: "CO",
        data: [],
        borderColor: "blue",
        fill: false,
      },
      {
        label: "불꽃",
        data: [],
        borderColor: "yellow",
        fill: false,
      },
    ],
  };

  updateChart(data);
}

let sensorChart;

function updateChart(data) {
  const ctx = document.getElementById("sensorChart").getContext("2d");
  if (sensorChart) {
    sensorChart.destroy();
  }
  sensorChart = new Chart(ctx, {
    type: "line",
    data: data,
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "?���?",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "�?",
          },
        },
      },
    },
  });
}

// 초기 ?��?��?�� 로드
showNodeData("node1");

// ?��?���? ?��?��?�� ?��?��
const socket = io();
socket.on("arduinoData", (data) => {
  const node1Data = data.find((node) => node.node === "Node1");
  if (node1Data) {
    const currentTime = new Date().toLocaleTimeString();
    if (sensorChart.data.labels.length > 10) {
      // 최근 10개의 ?��?��?���? ?���?
      sensorChart.data.labels.shift();
      sensorChart.data.datasets.forEach((dataset) => dataset.data.shift());
    }
    sensorChart.data.labels.push(currentTime);
    sensorChart.data.datasets[0].data.push(node1Data.temperature);
    sensorChart.data.datasets[1].data.push(node1Data.gas);
    sensorChart.data.datasets[2].data.push(node1Data.flame);
    sensorChart.update();
  }
});
