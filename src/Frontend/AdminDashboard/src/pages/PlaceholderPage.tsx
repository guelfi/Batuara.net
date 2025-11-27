import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

interface PlaceholderPageProps {
    title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    return (
        <Container maxWidth="lg">
            <Paper
                sx={{
                    p: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center',
                    gap: 3
                }}
            >
                <ConstructionIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        {title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Esta página está em construção.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Em breve você poderá gerenciar este conteúdo por aqui.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default PlaceholderPage;
