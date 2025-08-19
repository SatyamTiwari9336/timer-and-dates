"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(Number(inputLoanAmount.value));

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
//convertion of string to number;

console.log(Number("23"));
console.log(+"23");

//parsing
console.log(Number.parseInt("390tr3", 10));
console.log(Number.parseInt("er32", 10)); //we can or cannot use Number.
console.log(parseInt("30", 2)); //10 and 2 are rdix base 2 base 10
console.log(parseInt("2.5rem"));
console.log(parseFloat("2.5rem"));
//check if value is not a number
console.log(Number.isNaN("25"));
console.log(Number.isNaN(+"x120"));
console.log(Number.isNaN(23 / 0));
//chech if value is number
console.log(Number.isFinite(20));
console.log(Number.isFinite("231"));
console.log(Number.isFinite(23 / 0));
//for integers only
console.log(Number.isInteger("20"));
console.log(Number.isInteger(20));
////////////////////////////////////////
//Math.methods
console.log(Math.sqrt(49));
console.log(49 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(1, 2, 3, "23", 4, 21)); //it does type coersion
console.log(Math.min(1, 2, 0, "23", 4, 21));

console.log(Math.PI * Number.parseInt("10rem") ** 2);
console.log(Math.floor(Math.random() * 10) + 1);
// generating random numbers
const randomint = (min, max) =>
  Math.trunc(Math.random() * (max - min + 1)) + min;
console.log(randomint(1, 7));
console.log(randomint(10, 20));

console.log(Math.round(23.3)); //23
console.log(Math.round("23.7")); //24
console.log(Math.trunc(24.72189)); //24 //removes decimal
console.log(Math.floor(24.7534)); //24 //gives the nearest smaller interger
console.log(Math.ceil(24.72189)); //25
//all above methods do type coersion also
console.log(Math.trunc(-24.72)); //-24
console.log(Math.floor(-24.72)); //-25

//rounding and wanting answer in decimal
console.log((23.5).toFixed(4));
console.log((2.768).toFixed(2));
console.log(+(2.45).toFixed(0));

//remainder operator
console.log(8 / 2);
console.log(8 % 2);

console.log(5 / 2);
console.log(5 % 2);

const iseven = (el) => el % 2 === 0;
console.log(iseven(8));

console.log(iseven(9));
console.log(iseven(22));

//number seperators on js
const diameterofsun = 287_200_230_000;
console.log(diameterofsun);

const price = 23_500;
console.log(price);

const pi = 32_23.22;
console.log(pi);
//dont use it with parse int and is NaN
///////////////////////////////////////////////////////
//big ints
console.log(2 ** 53 + 1);

console.log(2846589360981857017589011390n);
console.log(BigInt(284658936098n));
//cannot mix big int with normal numbers
console.log(3298589589275897328957n * 1000000n);
const big = 2941092141749012589224n;
const mult = 23;
console.log(big * BigInt(mult));
console.log(20n > 15); //true
console.log(20 === 20n); //false
//math operation also dont work correctly withthem
console.log(10n / 3n);
/////////////////////////////////////////
//dates
const now = new Date();
console.log(now);
console.log(new Date("december 24 ,2025"));

console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 5, 10, 8, 5));
console.log(new Date(2037, 10, 33)); //nov 33 cahnged to dec 3

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));
*/

const future = new Date(2037, 10, 5, 10, 8);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getMinutes());
console.log(future.getHours());
console.log(future.getSeconds());
console.log(future.toISOString());

console.log(future.getTime());
console.log(new Date(2141008680000));
console.log(Date.now());
future.setFullYear(2040);
console.log(future);
//set month set date set date also exist
