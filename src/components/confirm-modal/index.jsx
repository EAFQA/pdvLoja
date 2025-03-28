import { Button, Typography } from '@mui/material';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    padding: 16px;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    background-color: #FFFFFF;
    border-radius: 8px;
    width: 500px;
`;

const Modal = styled.div`
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
`;

const FlexContainer = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

function ConfirmModal({ text, title, handleClose, onConfirm }) {
  return (
    <Modal>
        <Container>
            <Typography variant="h4" style={{ fontWeight: '400', fontSize: 28, marginBottom: 16 }}>
                {title}
            </Typography>

            <Typography variant="h4" style={{ fontSize: 18, textAlign: 'start' }}>
                {text}
            </Typography>

            <FlexContainer style={{ marginTop: 'auto', justifyContent: 'space-around' }}>
                <Button 
                    variant="contained" 
                    style={{ marginTop: 16, backgroundColor: '#ed2939' }}
                    size="large"
                    onClick={handleClose}
                >
                    Cancelar
                </Button>

                <Button 
                    variant="contained" 
                    style={{ marginTop: 16, backgroundColor:'#6baed6' }}
                    size="large"
                    onClick={onConfirm}
                >
                    Confirmar
                </Button>
            </FlexContainer>
        </Container>
    </Modal>
  );
}

export default ConfirmModal;
