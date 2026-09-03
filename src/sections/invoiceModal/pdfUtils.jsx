import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  Image
} from "@react-pdf/renderer";
import companyImage from "../../assets/logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  companyImage: {
    width: 80,
    height: 80,
    marginRight: 15,
    objectFit: "contain",
  },

  companyInfo: {
    flexDirection: "row",
    alignItems: "start"
  },

  header: {
    marginBottom: 20,
  },

  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },

  contact: {
    fontSize: 9,
    marginBottom: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  customerSection: {
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingVertical: 5,
  },

  headerRow: {
    backgroundColor: "#eeeeee",
    fontWeight: "bold",
  },

  name: {
    width: "50%",
  },

  quantity: {
    width: "12%",
    textAlign: "center",
  },

  unit: {
    width: "10%",
    textAlign: "center",
  },

  price: {
    width: "14%",
    textAlign: "right",
  },

  total: {
    width: "14%",
    textAlign: "right",
  },

  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },

  totalRow: {
    flexDirection: "row",
    marginBottom: 5,
  },

  totalLabel: {
    width: 120,
    textAlign: "right",
    marginRight: 10,
  },

  totalValue: {
    width: 80,
    textAlign: "right",
  },

  finalTotal: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
  },

  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 10,
  },

  observation: {
    marginTop: 4,
  },
});

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function getProductData(saleProduct, products) {
  // Caso products seja um array
  const product = Array.isArray(products)
    ? products.find((item) => item.id === saleProduct.id)
    : products?.[saleProduct.id];

  return {
    ...product,
    ...saleProduct,
  };
}

export function SalePDF({ sale, products, customer }) {
  const saleProducts = (sale?.products || []).map((saleProduct) =>
    getProductData(saleProduct, products)
  );

  const subtotal = saleProducts.reduce(
    (sum, product) =>
      sum + (Number(product.price) || 0) * (Number(product.quantity) || 0),
    0
  );

  const freight = Number(sale?.freight) || 0;
  const total = subtotal + freight;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.companyInfo}>
          <Image
            src={companyImage}
            style={styles.companyImage}
          />

          <Text style={styles.companyName}>
            ARTIGOS ASAS DE ANJO
          </Text>

          <Text></Text>
        </View>

        {/* CABEÇALHO */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {sale?.type === "sale" ? "VENDA" : "ORÇAMENTO"}
          </Text>

          <Text>
              Data: {formatDate(sale?.date)}
          </Text>
        </View>

        {/* TABELA */}
        <View>

          {/* HEADER */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.name}>
              Produto
            </Text>

            <Text style={styles.quantity}>
              Quantidade
            </Text>

            <Text style={styles.unit}>
              Unidade
            </Text>

            <Text style={styles.price}>
              Valor Unitário
            </Text>

            <Text style={styles.total}>
              Total
            </Text>
          </View>

          {/* PRODUTOS */}
          {saleProducts.map((product) => {

            const quantity = Number(product.quantity) || 0;
            const price = Number(product.price) || 0;
            const productTotal = quantity * price;

            return (
              <View
                key={product.id}
                style={styles.row}
              >
                <Text style={styles.name}>
                  {product.name || product.title}
                </Text>

                <Text style={styles.quantity}>
                  {(quantity).toString().replace('.', ',')}
                </Text>

                <Text style={styles.unit}>
                  {product.quantityType || "un"}
                </Text>

                <Text style={styles.price}>
                  {formatCurrency(price)}
                </Text>

                <Text style={styles.total}>
                  {formatCurrency(productTotal)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* TOTAIS */}
        <View style={styles.totals}>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Subtotal:
            </Text>

            <Text style={styles.totalValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>

          {freight > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Frete:
              </Text>

              <Text style={styles.totalValue}>
                {formatCurrency(freight)}
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.totalLabel}>
              Total:
            </Text>

            <Text style={styles.totalValue}>
              {formatCurrency(total)}
            </Text>
          </View>

        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>

          <Text>
            Forma de pagamento: {sale?.paymentType || "-"}
          </Text>

        </View>

      </Page>
    </Document>
  );
}

/*
 * Preview em tempo real
 */
export function SalePDFPreview({
  sale,
  products,
  customer,
  width = "100%",
  height = "400px",
}) {
  return (
    <PDFViewer
      width={width}
      height={height}
      style={{ border: "none" }}
    >
      <SalePDF
        sale={sale}
        products={products}
        customer={customer}
      />
    </PDFViewer>
  );
}

/*
 * Download do PDF
 */
export function SalePDFDownload({
  sale,
  products,
  customer,
  fileName = "venda.pdf",
  children = "Baixar PDF",
}) {
  return (
    <PDFDownloadLink
      document={
        <SalePDF
          sale={sale}
          products={products}
          customer={customer}
        />
      }
      fileName={fileName}
    >
      {({ loading }) =>
        loading ? "Gerando PDF..." : children
      }
    </PDFDownloadLink>
  );
}