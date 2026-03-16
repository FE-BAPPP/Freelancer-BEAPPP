import { ReactNode } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { PostJobModal } from "../Employer/PostJobModal"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

interface LayoutProps {
    children: ReactNode
}

export function Layout({ children }: LayoutProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { role } = useAuth();
    const showPostJobModal = searchParams.get('postJob') === 'true' && role === 'EMPLOYER';

    const handleCloseModal = () => {
        searchParams.delete('postJob');
        setSearchParams(searchParams);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            <div className="flex flex-1 relative">
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>

            <PostJobModal isOpen={showPostJobModal} onClose={handleCloseModal} />

            <Footer />
        </div>
    )
}
