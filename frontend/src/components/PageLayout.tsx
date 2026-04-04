import React, { ReactNode } from 'react';
import { Box, Typography, Stack } from '@mui/material';

const DRAWER_WIDTH = 270;

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
    maxWidth?: number;
}

/**
 * Reusable full-width page layout component
 * Provides consistent header with gradient and content area
 */
const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    subtitle,
    actions,
    children,
    maxWidth = 1400,
}) => {
    return (
        <Box
            sx={{
                position: 'absolute',
                top: { xs: 56, md: 64 },
                left: { xs: 0, md: DRAWER_WIDTH },
                right: 0,
                bottom: 0,
                bgcolor: '#f5f7fa',
                overflow: 'auto',
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                    pt: 4,
                    pb: 8,
                    px: 3,
                }}
            >
                <Box maxWidth={maxWidth} mx="auto">
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                    >
                        <Box>
                            <Typography variant="h4" fontWeight={700} color="white" mb={0.5}>
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                        {actions && <Box>{actions}</Box>}
                    </Stack>
                </Box>
            </Box>

            {/* Main Content */}
            <Box maxWidth={maxWidth} mx="auto" px={3} sx={{ mt: -5, pb: 4 }}>
                {children}
            </Box>
        </Box>
    );
};

export default PageLayout;
