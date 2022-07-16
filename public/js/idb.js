let db;
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_cash_flow", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadCashFlow();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_cash_flow"], "readwrite");
  const cashFlowObjStore = transaction.objectStore("new_cash_flow");
  cashFlowObjStore.add(record);
}

function uploadCashFlow() {
  const transaction = db.transaction(["new_cash_flow"], "readwrite");
  const cashFlowObjStore = transaction.objectStore("new_cash_flow");
  const getAll = cashFlowObjStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(["new_cash_flow"], "readwrite");
          const cashFlowObjStore = transaction.objectStore("new_cash_flow");
          cashFlowObjStore.clear();
          console.log("online again, money added");
          alert("You're online bro! Funds added :)");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadCashFlow);
