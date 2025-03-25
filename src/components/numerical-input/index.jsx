import { TextField } from "@mui/material";

function NumericalInput ({ onUpdate, quantityValue, title, width = '45%', required = false, height = "" }) {
  return (
        <TextField 
            id="name" 
            label={title}
            variant="outlined" 
            value={quantityValue}
            onChange={(event) => {
                const value = event.target.value;
                if (!isNaN(value) && value >= 0 && !value.includes('e') && !value.includes('.')) {
                    onUpdate(event.target.value);
                } else {
                    event.target. value = quantityValue;
                }
            }}
            type='number'
            sx={{
                width,
                maxHeight: height
            }}
            required={required}
            style={{ marginBottom: 16 }}
        />
  );
}

export default NumericalInput;
