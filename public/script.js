document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const userName = document.querySelector('input[name="userName"]').value;

    if (userName === "1234") {
      // admin.html 페이지를 새 창에서 엽니다.
      const adminWindow = window.open("admin.html", "_blank");

      // 새 창이 성공적으로 열리면 현재 창을 닫습니다.
      if (adminWindow) {
        window.close();
      } else {
        alert("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
      }
    } else {
      alert("잘못된 관리자 번호입니다.");
    }
  });
//팝업창 띄우는 코드
document.getElementById("info").addEventListener("click", function () {
  document.querySelector(".login-wrapper").classList.toggle("active");
});

//팝업창 닫는 코드
document.querySelector(".close-btn").addEventListener("click", function () {
  document.querySelector(".login-wrapper").classList.remove("active");
});

function selectFloor(element, mapImage) {
  // 紐⑤뱺 floor-item?뿉?꽌 active ?겢?옒?뒪 ?젣嫄?
  const floors = document.querySelectorAll(".floor-item");
  floors.forEach((floor) => {
    floor.classList.remove("active");
  });

  // ?겢由??븳 ?슂?냼?뿉 active ?겢?옒?뒪 異붽??
  element.classList.add("active");

  // 留? ?씠誘몄?? 蹂?寃?
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
  // 珥덇린 ?뜲?씠?꽣 濡쒕뱶 (?끂?뱶 ?꽑?깮 ?떆 珥덇린?솕)
  const data = {
    labels: [],
    datasets: [
      {
        label: "?삩?룄",
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
        label: "遺덇퐙",
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
            text: "?떆媛?",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "媛?",
          },
        },
      },
    },
  });
}

// 珥덇린 ?뜲?씠?꽣 濡쒕뱶
showNodeData("node1");

// ?떎?떆媛? ?뜲?씠?꽣 ?닔?떊
const socket = io();
socket.on("arduinoData", (data) => {
  const node1Data = data.find((node) => node.node === "Node1");
  if (node1Data) {
    const currentTime = new Date().toLocaleTimeString();
    if (sensorChart.data.labels.length > 10) {
      // 理쒓렐 10媛쒖쓽 ?뜲?씠?꽣留? ?쑀吏?
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
