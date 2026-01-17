import './globals.css'

export const metadata = {
    title: 'College Placement Prediction System',
    description: 'AI-powered placement and salary prediction for students',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
