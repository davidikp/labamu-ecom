import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function mockWriterPlugin() {
  return {
    name: 'mock-writer',
    configureServer(server) {
      server.middlewares.use('/api/dev/write-mock', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const formData = JSON.parse(body);
              
              // Reverse-map standard UI formData into underlying raw backend notation
              const mockPayload = {
                 id: formData.id || 478,
                 company_name: formData.brandName || formData.businessName,
                 company_official_name: formData.businessName || formData.legalName,
                 company_whatsapp: formData.whatsapp,
                 company_uid: formData.uid || 'bpo3ok',
                 company_slug: formData.slug || 'teakworks-1',
                 company_address: formData.address || '',
                 company_city: formData.city || '',
                 company_province: formData.province || '',
                 company_district: formData.district || '',
                 company_village: formData.region || '',
                 company_country: formData.country || '',
                 company_zipcode: formData.postalCode || '',
                 company_email_contact: formData.email || '',
                 company_phone: formData.phone || '',
                 company_lat: formData.lat || -6.5891,
                 company_long: formData.long || 110.6742,
                 company_tax_number: formData.businessNpwp || formData.personalNpwp || '',
                 company_rt: formData.rt || '',
                 company_rw: formData.rw || '',
                 type: 'OUTLET',
                 business_entity: { name_en: formData.entity || 'pt', id: formData.entityId },
                 company_product_types: { name_id: formData.type || 'Produk dan Jasa', name_en: formData.typeEn, id: formData.typeId },
                 company_industry: { 
                   id: formData.industryId,
                   name_id: formData.industryLabelId || '',
                   name_en: formData.industryLabelEn || ''
                 },
                 business_activity: { business_activity: formData.activity || 'Online & Offline' }
              };
              
              const mockFilePath = path.resolve(__dirname, 'src/api/mocks/company.js');
              const fileContent = `/**
 * @module api/mocks/company
 * @description Auto-generated mock payload from UI.
 */
import { registerMock } from '../client.js';

const COMPANY_DETAIL = ${JSON.stringify(mockPayload, null, 2)};

// ── Register mocks ───────────────────────────────────────────────────
registerMock('GET', '/companies/:uid', (_params) => {
  return { data: COMPANY_DETAIL };
});
`;
              fs.writeFileSync(mockFilePath, fileContent, 'utf-8');
              
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error('Mock Writer Error:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mockWriterPlugin()],
  server: {
    port: 5174,
    allowedHosts: true,
    watch: {
      // Prevent full page reload when mockWriterPlugin updates the physical company.js file
      ignored: ['**/src/api/mocks/**']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
  },
})
