let db;
// use 17-NoSQL/01-Activities/26-Stu-Mini-Project/Solved/public/db.js 
// as a template here.


// created a new db request for a budget database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {
   console.log(event);
   const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = (event) => {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (event) => {
  console.log("M.e.t.h.o.d. Man! " + event.target.errorCode);
};

function saveRecord(record) {
  console.log(record);
  
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from the stored transaction and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // open a transaction on your pending db if it works
        const transaction = db.transaction(["pending"], "readwrite");

        // access the pending object store
        const store = transaction.objectStore("pending");

        // clear the store
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);