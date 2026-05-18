const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const paymentMethodInput = document.getElementById("paymentMethod");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");
const transactionList = document.getElementById("transactionList");
const filterType = document.getElementById("filterType");
const searchInput = document.getElementById("searchInput");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

dateInput.valueAsDate = new Date();

function saveToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function renderSummary() {
  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = totalIncome - totalExpense;

  totalIncomeEl.textContent = formatRupiah(totalIncome);
  totalExpenseEl.textContent = formatRupiah(totalExpense);
  balanceEl.textContent = formatRupiah(balance);
}

function renderTransactions() {
  transactionList.innerHTML = "";

  const selectedType = filterType.value;
  const keyword = searchInput.value.toLowerCase();

  const filteredTransactions = transactions.filter((item) => {
    const matchType = selectedType === "all" || item.type === selectedType;

    const matchSearch =
      item.title.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword) ||
      item.note.toLowerCase().includes(keyword) ||
      (item.paymentMethod || "").toLowerCase().includes(keyword);

    return matchType && matchSearch;
  });

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `
      <tr>
        <td colspan="7" class="empty">Belum ada transaksi.</td>
      </tr>
    `;
    renderSummary();
    return;
  }

  filteredTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((item) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.date}</td>
        <td>
          <strong>${item.title}</strong><br />
          <small>${item.note || "Tidak ada catatan"}</small>
        </td>
        <td>${item.category}</td>
        <td>${item.paymentMethod || "-"}</td>
        <td>
          <span class="badge ${item.type === "income" ? "badge-income" : "badge-expense"}">
            ${item.type === "income" ? "Pemasukan" : "Pengeluaran"}
          </span>
        </td>
        <td>${formatRupiah(item.amount)}</td>
        <td>
          <button class="btn-danger" onclick="deleteTransaction(${item.id})">Hapus</button>
        </td>
      `;

      transactionList.appendChild(row);
    });

  renderSummary();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const transaction = {
    id: Date.now(),
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value.trim(),
    paymentMethod: paymentMethodInput.value,
    date: dateInput.value,
    note: noteInput.value.trim(),
  };

  transactions.push(transaction);
  saveToLocalStorage();
  renderTransactions();

  form.reset();
  dateInput.valueAsDate = new Date();
});

function deleteTransaction(id) {
  const confirmDelete = confirm("Yakin ingin menghapus transaksi ini?");

  if (!confirmDelete) return;

  transactions = transactions.filter((item) => item.id !== id);
  saveToLocalStorage();
  renderTransactions();
}

function resetTransactions() {
  const confirmReset = confirm("Yakin ingin menghapus semua transaksi?");

  if (!confirmReset) return;

  transactions = [];
  saveToLocalStorage();
  renderTransactions();
}

renderTransactions();
