import * as React from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const steps = ['Order Details', 'Payment', 'Order Review']

function HorizontalStepper({
    activeStep,
    handleNext,
    handleBack,
    handleReset,
}: any) {
    return (
        <Box sx={{ width: '100%', marginBottom: '30px' }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    )
}

export default HorizontalStepper
