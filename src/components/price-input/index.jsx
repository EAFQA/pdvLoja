import { InputAdornment, TextField } from "@mui/material";

function PriceInput ({ onUpdate, priceValue, title, required = false, width = "25%" }) {
  return (
        <TextField 
            id="name" 
            label={title}
            variant="outlined" 
            value={priceValue}
            slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                },
            }}
            onChange={(event) => {
                const value = event.target.value;
                if (!isNaN(value) && value >= 0 && value < 9999.99 && !value.includes('e')) {
                    if (value.includes('.')) {
                        const decimal = value.split('.')[1];
                        if (decimal?.length > 2) return;
                    }

                    onUpdate(event.target.value);
                } else {
                    event.target. value = priceValue;
                }
            }}
            sx={{
                width
            }}
            required={required}
            type='number'
            style={{ marginBottom: 16 }}
        />
  );
}

export default PriceInput;
