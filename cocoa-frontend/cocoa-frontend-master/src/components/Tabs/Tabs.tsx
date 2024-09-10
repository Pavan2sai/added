// src/components/Tabs/FullWidthTabs.js
import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const TabPanel = (props: any) => {
    const { children, value, index, ...other } = props

    return (
        
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
            style={{ height: '100%', overflowY: 'auto' }} // Enable scrolling for the content
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    )
}

export default function FullWidthTabs({
    children,
    value,
    handleTabChange,
}: any) {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs
                value={value}
                indicatorColor="secondary"
                textColor="inherit"
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="full width tabs example"
            >
                <Tab label="Products" />
                <Tab label="Inbox" />
            </Tabs>
            <div style={{ flex: 1 }}>
                {React.Children.map(children, (child, index) => (
                    <TabPanel value={value} index={index}>
                        {child}
                    </TabPanel>
                ))}
            </div>
        </Box>
    )
}
