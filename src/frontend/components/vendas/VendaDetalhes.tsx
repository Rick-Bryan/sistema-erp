import React from "react";
import { Button, Typography, Box, Paper } from "@mui/material";

const VendaDetalhes = ({ venda, voltar }: any) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Detalhes da Venda #{venda?.id}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography>Cliente: {venda?.cliente}</Typography>
        <Typography>Total: R$ {venda?.total?.toFixed(2)}</Typography>
        <Typography>Data: {new Date().toLocaleDateString()}</Typography>
      </Paper>

      <Button variant="outlined" onClick={voltar}>
        Voltar
      </Button>
    </Box>
  );
};

export default VendaDetalhes;
