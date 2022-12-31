/*
  emi = P * r * ((1+r)^n / ((1+r)^n -1))
  where, 
  P -> Principal Loan Amount
  r -> Monthy interest rate
  n -> Number of period in months
*/
export const getAcceleratedEmiPlan = (inputs) => {
  const {
    interestRate,
    numberOfMonths,
    loanAmount,
    emiStartDate,
    emiHikeRate,
    regularPrepayment,
  } = inputs;
  const monthlyInterestRate = interestRate / 12 / 100;
  const rate = Math.pow(1 + monthlyInterestRate, numberOfMonths);
  const baseEmi = loanAmount * monthlyInterestRate * (rate / (rate - 1));
  let emi = baseEmi;

  let loanRemaining = loanAmount;
  let payments = [];
  for (let index = 0; index < numberOfMonths; index++) {
    //Increasing the EMI by the user given rate starting off from second year
    if (emiHikeRate && index !== 0 && index % 12 === 0) {
      emi += emi * (emiHikeRate.value / 100);
    }

    const interestComponent = monthlyInterestRate * loanRemaining;
    const isLastEmi = loanRemaining + interestComponent <= emi;
    const pricipalComponent = isLastEmi
      ? loanRemaining
      : emi - interestComponent;
    loanRemaining = isLastEmi ? 0 : loanRemaining - pricipalComponent;

    let regularPrepaymentAmount = 0;
    if (regularPrepayment) {
      const yearly = index !== 0 && (index + 1) % 12 === 0;
      const quarterly = index !== 0 && (index + 1) % 3 === 0;
      if (
        (regularPrepayment.interval === 'year' && yearly) ||
        (regularPrepayment.interval === 'quarter' && quarterly) ||
        regularPrepayment.interval === 'month'
      ) {
        loanRemaining -= regularPrepayment.amount;
        regularPrepaymentAmount = regularPrepayment.amount;
      }
    }

    payments.push({
      installmentNumber: index,
      paymentDate: getNthPaymentDate(emiStartDate, index),
      pricipalComponent: pricipalComponent,
      interestComponent: interestComponent,
      emi: pricipalComponent + interestComponent,
      regularPrepaymentAmount,
      loanRemaining: loanRemaining,
    });
  }
  payments = payments.filter((payment) => payment.emi > 0);

  return {
    payments: groupPaymentsByYear(payments),
    numberOfInstallments: payments.length,
    totalInterest: Math.round(
      payments.reduce((acc, curr) => acc + curr.interestComponent, 0)
    ),
    totalPrincipal: loanAmount,
  };
};

/*
  emi = P * r * ((1+r)^n / ((1+r)^n -1))
  where, 
  P -> Principal Loan Amount
  r -> Monthy interest rate
  n -> Number of period in months
*/
export const getRegularEmiPlan = (inputs) => {
  const { interestRate, numberOfMonths, loanAmount, emiStartDate } = inputs;
  const monthlyInterestRate = interestRate / 12 / 100;
  const rate = Math.pow(1 + monthlyInterestRate, numberOfMonths);
  const emi = loanAmount * monthlyInterestRate * (rate / (rate - 1));

  let loanRemaining = loanAmount;
  let payments = [];
  for (let index = 0; index < numberOfMonths; index++) {
    const interestComponent = monthlyInterestRate * loanRemaining;
    const isLastEmi = loanRemaining + interestComponent <= emi;
    const pricipalComponent = isLastEmi
      ? loanRemaining
      : emi - interestComponent;
    loanRemaining = isLastEmi ? 0 : loanRemaining - pricipalComponent;

    payments.push({
      date: getNthPaymentDate(emiStartDate, index),
      installmentNumber: index,
      paymentDate: getNthPaymentDate(emiStartDate, index),
      emi: pricipalComponent + interestComponent,
      pricipalComponent: pricipalComponent,
      interestComponent: interestComponent,
      loanRemaining: loanRemaining,
    });
  }
  payments = payments.filter((payment) => payment.emi > 0);

  return {
    payments: groupPaymentsByYear(payments),
    numberOfInstallments: payments.length,
    totalInterest: Math.round(
      payments.reduce((acc, curr) => acc + curr.interestComponent, 0)
    ),
    totalPrincipal: loanAmount,
  };
};

export const groupPaymentsByYear = (payments) => {
  const years = payments.map((payment) => payment.paymentDate.getFullYear());
  const uniqueYears = Array.from(new Set(years));
  return uniqueYears.map((year) => {
    return {
      year,
      payments: payments.filter(
        (payment) => payment.paymentDate.getFullYear() === year
      ),
    };
  });
};

export const getMonthByIndex = (monthIndex) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months.at(monthIndex);
};

export const getNthPaymentDate = (startDate, installmentNumber) => {
  const paymentDate = new Date(startDate);
  paymentDate.setMonth(startDate.getMonth() + installmentNumber);
  return paymentDate;
};

export const formatNumber = (number, options) => {
  const { locale, isCompact, roundOff } = options;
  const roundedNumber = roundOff ? Math.round(number) : number;
  const notation = isCompact && number >= 100000000 ? 'compact' : 'standard';
  return new Intl.NumberFormat(locale, { notation }).format(roundedNumber);
};

export const formatCurrency = (number, locale, currencyCode) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(number);
};

export const getCurrencySymbol = (locale, currency) => {
  return (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim();
};
