import "@/app/globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Notícias do Flamengo",
  description: "Crawler de notícias do Flamengo da Coluna do Fla",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
       
          {children}
      </body>
    </html>
  )
}

