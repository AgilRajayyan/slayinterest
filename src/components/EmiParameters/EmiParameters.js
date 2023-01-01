import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useContext } from 'react';
import classes from './EmiParameters.module.css';
import { UserPreferenceContext } from '../../utils/UserPreferenceContext';
import { getCurrencySymbol } from '../../utils/helper';
import { useTranslation } from 'react-i18next';

function EmiParameters(props) {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, seInterestRate] = useState(8);
  const [numberOfYears, setNumberOfYears] = useState(25);
  const [emiStartdate, setEmiStartdate] = useState(dayjs(new Date()));
  const userPreference = useContext(UserPreferenceContext);
  const { locale, currency } = userPreference;
  const { t } = useTranslation();

  useEffect(() => {
    props.onChangeEmiParams({
      loanAmount,
      interestRate,
      numberOfYears,
      emiStartDate: new Date(emiStartdate.$y, emiStartdate.$M, 1),
    });
  }, [loanAmount, interestRate, numberOfYears, emiStartdate]);

  return (
    <section className={classes.inputs_container}>
      <TextField
        label={t('emi.params.loan.amount')}
        type="number"
        id="outlined-start-adornment"
        value={loanAmount}
        onChange={(event) => setLoanAmount(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {getCurrencySymbol(locale, currency)}
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label={t('emi.params.interest.rate')}
        type="number"
        id="outlined-end-adornment"
        value={interestRate}
        onChange={(event) => seInterestRate(Number(event.target.value))}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
      />
      <TextField
        label={t('emi.params.loan.tenure')}
        type="number"
        id="outlined-end-adornment"
        value={numberOfYears}
        onChange={(event) => setNumberOfYears(Number(event.target.value))}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {t('emi.params.years')}
            </InputAdornment>
          ),
        }}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={t('emi.params.start.date')}
          views={['year', 'month']}
          value={emiStartdate}
          onChange={(value) => setEmiStartdate(value)}
          renderInput={(params) => <TextField {...params} helperText={null} />}
        />
      </LocalizationProvider>
    </section>
  );
}

export default EmiParameters;
