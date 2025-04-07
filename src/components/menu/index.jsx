import styled from 'styled-components';
import { ImCart } from "react-icons/im";
import { useCallback, useMemo } from 'react';
import { MdAddBusiness } from "react-icons/md";
import { MdCategory } from "react-icons/md";

const Container = styled.div`
    display: flex;
    padding: 16px;
    flex-direction: column;
    align-content: space-between;
    align-items: center;
    margin-top: 16px;
`;

const MenuItem = styled.div`
    cursor: pointer;
    width: 80px;
    height: 40px;
    align-items: center;
    margin-bottom: 60px;
`;

const inactiveColor = '#808080';
const activeColor = '#6baed6';


function Menu({ handleRouteChange, currentRoute }) {

    const getSectionColor = useCallback((section) => {
        return currentRoute === section ? activeColor : inactiveColor;
    }, [currentRoute]);

    const cartStyle = useMemo(() => ({
        height: 40,
        width: 40,
        color: getSectionColor('cart'),
    }), [currentRoute, getSectionColor]);

    const stockManagementStyle = useMemo(() => ({
        height: 40,
        width: 40,
        color: getSectionColor('stock'),
    }), [currentRoute, getSectionColor]);

    const categoryManagementStyle = useMemo(() => ({
        height: 40,
        width: 40,
        color: getSectionColor('category'),
    }), [currentRoute, getSectionColor]);

  return (
    <Container>
        <MenuItem onClick={() => handleRouteChange('cart')}>
            <ImCart style={cartStyle}/>
            <p style={{ color: cartStyle.color, margin: 0 }}>Carrinho</p>
        </MenuItem>
        <MenuItem onClick={() => handleRouteChange('stock')}>
            <MdAddBusiness style={stockManagementStyle}/>
            <p style={{ color: stockManagementStyle.color, margin: 0 }}>Estoque</p>
        </MenuItem>
        <MenuItem onClick={() => handleRouteChange('category')}>
            <MdCategory style={categoryManagementStyle}/>
            <p style={{ color: categoryManagementStyle.color, margin: 0 }}>Categorias</p>
        </MenuItem>
    </Container>
  );
}

export default Menu;
