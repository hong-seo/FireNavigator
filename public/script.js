document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // ÆûÀÇ ±âº» Á¦Ãâ µ¿ÀÛÀ» ¸·À½

    const userName = document.querySelector('input[name="userName"]').value;

    if (userName === "1234") {
      // admin.html ÆäÀÌÁö¸¦ »õ Ã¢¿¡¼­ ¿±´Ï´Ù.
      const adminWindow = window.open("admin.html", "_blank");

      // »õ Ã¢ÀÌ ¼º°øÀûÀ¸·Î ¿­¸®¸é ÇöÀç Ã¢À» ´İ½À´Ï´Ù.
      if (adminWindow) {
        window.close();
      } else {
        alert("ÆË¾÷ÀÌ Â÷´ÜµÇ¾ú½À´Ï´Ù. ÆË¾÷ Â÷´ÜÀ» ÇØÁ¦ÇÏ°í ´Ù½Ã ½ÃµµÇØÁÖ¼¼¿ä.");
      }
    } else {
      alert("Àß¸øµÈ °ü¸®ÀÚ ¹øÈ£ÀÔ´Ï´Ù.");
    }
  });
//ÆË¾÷Ã¢ ¶ç¿ì´Â ÄÚµå
document.getElementById("info").addEventListener("click", function () {
  document.querySelector(".login-wrapper").classList.toggle("active");
});

//ÆË¾÷Ã¢ ´İ´Â ÄÚµå
document.querySelector(".close-btn").addEventListener("click", function () {
  document.querySelector(".login-wrapper").classList.remove("active");
});

function selectFloor(element, mapImage) {
  // ëª¨ë“  floor-item?—?„œ active ?´?˜?Š¤ ? œê±?
  const floors = document.querySelectorAll(".floor-item");
  floors.forEach((floor) => {
    floor.classList.remove("active");
  });

  // ?´ë¦??•œ ?š”?†Œ?— active ?´?˜?Š¤ ì¶”ê??
  element.classList.add("active");

  // ë§? ?´ë¯¸ì?? ë³?ê²?
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
  // ì´ˆê¸° ?°?´?„° ë¡œë“œ (?…¸?“œ ?„ ?ƒ ?‹œ ì´ˆê¸°?™”)
  const data = {
    labels: [],
    datasets: [
      {
        label: "?˜¨?„",
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
        label: "ë¶ˆê½ƒ",
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
            text: "?‹œê°?",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "ê°?",
          },
        },
      },
    },
  });
}

// ì´ˆê¸° ?°?´?„° ë¡œë“œ
showNodeData("node1");

// ?‹¤?‹œê°? ?°?´?„° ?ˆ˜?‹ 
const socket = io();
socket.on("arduinoData", (data) => {
  const node1Data = data.find((node) => node.node === "Node1");
  if (node1Data) {
    const currentTime = new Date().toLocaleTimeString();
    if (sensorChart.data.labels.length > 10) {
      // ìµœê·¼ 10ê°œì˜ ?°?´?„°ë§? ?œ ì§?
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
