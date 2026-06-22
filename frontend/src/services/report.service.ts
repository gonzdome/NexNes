const API_BASE_URL = 'http://localhost:3002';

export interface UserSession {
    id: string;
    name: string;
    email: string;
    tier: string;
}

export interface ReportResponse {
    success: boolean;
    message: string;
    jobId?: string;
}

export interface SendReportDto {
    title: string;
    content: string;
}

export const ReportService = {
    async getSession(): Promise<UserSession> {
        const response = await fetch(`${API_BASE_URL}/session`);
        if (!response.ok) throw new Error('Erro ao buscar sessão');
        return response.json();
    },

    async requestReport(payload: SendReportDto): Promise<ReportResponse> {
        const response = await fetch(`${API_BASE_URL}/session/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return { success: response.status === 202, message: data.message, jobId: data.jobId, };
    }
};