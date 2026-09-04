import { api, registerMock } from '../api/client';

export async function submitRfq(payload) {
  return api.post('/rfq', payload);
}

registerMock('POST', '/rfq', (_params, _body) => ({
  data: { rfq_no: 'RFQ-DEMO-001', status: 'DRAFT', id: 'mock-rfq-id' },
  message: 'Success create RFQ',
  status: 201,
}));
