import styled from 'styled-components';

export const ModalContainer = styled.div`
    position: fixed;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    min-width: 200px;
    min-height: 80px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
`;

export const ModalButton = styled.button`
    padding: 10px 20px;
    background-color: ${props => props.backgroundColor};
    color: white;
`;

export const ModalQuestion = styled.p`
    font-size: 16px;
    font-weight: bold;
    text-align: center;
`;