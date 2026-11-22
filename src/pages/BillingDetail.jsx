import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import billingApi from '../api/billingApi';
import patientApi from '../api/patientApi';
import './OpBilling.css';

// Service catalog for billing items
const serviceCatalog = [
  { id: 'CONS-001', name: 'Consultation Fee', category: 'Consultation', rate: 500 },
  { id: 'CONS-002', name: 'Specialist Consultation', category: 'Consultation', rate: 1000 },
  { id: 'CONS-003', name: 'Follow-up Consultation', category: 'Consultation', rate: 300 },
  { id: 'LAB-001', name: 'Complete Blood Count (CBC)', category: 'Laboratory', rate: 350 },
  { id: 'LAB-002', name: 'Blood Sugar (Fasting)', category: 'Laboratory', rate: 150 },
  { id: 'LAB-003', name: 'Lipid Profile', category: 'Laboratory', rate: 600 },
  { id: 'LAB-004', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Laboratory', rate: 800 },
  { id: 'LAB-005', name: 'Urine Routine', category: 'Laboratory', rate: 200 },
  { id: 'RAD-001', name: 'X-Ray (Single View)', category: 'Radiology', rate: 400 },
  { id: 'RAD-002', name: 'Ultrasound Abdomen', category: 'Radiology', rate: 1200 },
  { id: 'RAD-003', name: 'ECG', category: 'Radiology', rate: 250 },
  { id: 'PROC-001', name: 'Wound Dressing', category: 'Procedure', rate: 200 },
  { id: 'PROC-002', name: 'Injection Administration', category: 'Procedure', rate: 100 },
  { id: 'PROC-003', name: 'Nebulization', category: 'Procedure', rate: 150 },
  { id: 'MED-001', name: 'Pharmacy Charges', category: 'Pharmacy', rate: 0 },
];

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'insurance', label: 'Insurance', icon: '🏥' },
];

const BillingDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = useParams();

  // Determine context from URL
  const basePath = location.pathname.split('/')[1] || 'op-billing';
  const getBillingContext = (path) => {
    switch (path) {
      case 'ip-billing': return { title: 'IP Bill', fullTitle: 'IP Billing', subtitle: 'Generate inpatient bill for the selected patient', icon: '🏥', type: 'IP' };
      case 'lab-billing': return { title: 'Lab Bill', fullTitle: 'Lab Billing', subtitle: 'Generate laboratory bill for the selected patient', icon: '🔬', type: 'LAB' };
      case 'pharmacy-billing': return { title: 'Pharmacy Bill', fullTitle: 'Pharmacy Billing', subtitle: 'Generate pharmacy bill for the selected patient', icon: '💊', type: 'PHARMACY' };
      case 'other-billing': return { title: 'Other Bill', fullTitle: 'Other Billing', subtitle: 'Generate miscellaneous bill for the selected patient', icon: '📝', type: 'OTHER' };
      case 'create-bill': return { title: 'Create Bill', fullTitle: 'Create Bill', subtitle: 'Generate new bill for the selected patient', icon: '🧾', type: 'OP' };
      default: return { title: 'OP Bill', fullTitle: 'OP Billing', subtitle: 'Generate outpatient bill for the selected patient', icon: '💰', type: 'OP' };
    }
  };
  const context = getBillingContext(basePath);
  const backPath = `/${basePath}`;

  // Get patient from navigation state or fetch by MRN
  const [patient, setPatient] = useState(location.state?.patient || null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  useEffect(() => {
    if (!patient && patientId) {
      setIsLoadingPatient(true);
      patientApi.getByMrn(patientId)
        .then(p => {
          if (p) {
            setPatient({
              id: p.mrn || p.id,
              mrn: p.mrn || p.id,
              name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
              phone: p.phone || '',
              dob: p.dob || '',
              gender: p.gender || '',
              bloodGroup: p.bloodGroup || '',
              email: p.email || '',
              address: p.address || '',
              city: p.city || ''
            });
          }
        })
        .catch(err => {
          console.warn("Could not fetch patient by MRN:", err);
        })
        .finally(() => {
          setIsLoadingPatient(false);
        });
    }
  }, [patient, patientId]);

  // Billing items
  const [items, setItems] = useState([
    { id: Date.now(), serviceId: 'CONS-001', serviceName: 'Consultation Fee', quantity: 1, rate: 500 }
  ]);

  // Discount & payment
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [billResult, setBillResult] = useState(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const total = subtotal - discountAmount;

  const handleAddItem = () => {
    setItems(prev => [...prev, {
      id: Date.now(),
      serviceId: '',
      serviceName: '',
      quantity: 1,
      rate: 0,
    }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      if (field === 'serviceId') {
        const service = serviceCatalog.find(s => s.id === value);
        return {
          ...item,
          serviceId: value,
          serviceName: service?.name || '',
          rate: service?.rate || 0,
        };
      }
      if (field === 'quantity') {
        return { ...item, quantity: Math.max(1, parseInt(value) || 1) };
      }
      if (field === 'rate') {
        return { ...item, rate: Math.max(0, parseFloat(value) || 0) };
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    if (!patient) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const billPayload = {
        patientMrn: patient.id || patient.mrn,
        patientName: patient.name,
        billType: context.type || 'OP',
        items: items.map(item => ({
          description: item.serviceName || 'Medical Service',
          quantity: item.quantity,
          unitPrice: item.rate
        }))
      };

      const createdBill = await billingApi.create(billPayload);
      let finalBill = createdBill;

      // Automatically mark paid if a payment method was chosen
      try {
        const paid = await billingApi.pay(createdBill.id, paymentMethod.toUpperCase());
        if (paid) finalBill = paid;
      } catch (payErr) {
        console.warn("Payment processing warning:", payErr);
      }

      setInvoiceNumber(finalBill.invoiceNumber || createdBill.invoiceNumber);
      setBillResult(finalBill);
      setInvoiceGenerated(true);
    } catch (err) {
      console.error("Failed to generate bill:", err);
      setSubmitError(typeof err === 'string' ? err : (err?.message || 'Failed to create bill in Billing Service. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no patient data, show fallback
  if (!patient) {
    return (
      <div className="opbill-page-container">
        <Container>
          <Row className="justify-content-center">
            <Col lg={12} xl={12}>
              <div className="opbill-card shadow-lg">
                <div className="opbill-header">
                  <span className="opbill-header-icon">{context.icon}</span>
                  <h2 className="opbill-title">{context.fullTitle}</h2>
                  <p className="opbill-subtitle mb-0">No patient selected</p>
                </div>
                <div className="opbill-body" style={{ textAlign: 'center', padding: '3rem' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔎</span>
                  <h4 style={{ color: '#334e68', marginBottom: '0.5rem' }}>No Patient Selected</h4>
                  <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please search and select a patient from the {context.fullTitle} page.</p>
                  <button className="btn-opbill-submit" onClick={() => navigate(backPath)}>
                    ← Go to Patient Search
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="opbill-page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} xl={12}>
            <div className="opbill-card shadow-lg">

              {/* Header */}
              <div className="opbill-detail-header">
                <div className="opbill-detail-header-top">
                  <button className="opbill-back-btn" onClick={() => navigate(backPath)} id="btn-back-to-search">
                    ← Back to Search
                  </button>
                  <span className="opbill-invoice-badge">
                    {invoiceGenerated ? `📄 ${invoiceNumber}` : '📄 New Invoice'}
                  </span>
                </div>
                <div className="opbill-detail-header-center">
                  <h2 className="opbill-title">{context.title} — {patient.name}</h2>
                  <p className="opbill-subtitle mb-0">{context.subtitle}</p>
                </div>
              </div>

              <div className="opbill-body text-start">

                {/* Patient Info Strip */}
                <div className="opbill-patient-strip">
                  <div className="opbill-patient-strip-info">
                    <div className="opbill-patient-avatar">{getInitials(patient.name)}</div>
                    <div className="opbill-patient-meta">
                      <h4>{patient.name}</h4>
                      <div className="opbill-patient-meta-details">
                        <span>📞 {patient.phone}</span>
                        <span>🎂 {calculateAge(patient.dob)} yrs, {patient.gender}</span>
                        <span>🩸 {patient.bloodGroup}</span>
                      </div>
                    </div>
                  </div>
                  <span className="opbill-patient-strip-mrn">{patient.id}</span>
                </div>

                {!invoiceGenerated && (
                  <>
                    {/* Billing Items */}
                    <div className="opbill-section-title">
                      <span>🧾</span> Billing Items
                    </div>
                    <div className="opbill-items-table-wrapper">
                      <table className="opbill-items-table" id="opbill-items-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Service / Item</th>
                            <th>Qty</th>
                            <th>Rate (₹)</th>
                            <th>Amount (₹)</th>
                            <th>Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: 600, color: '#7c3aed' }}>{index + 1}</td>
                              <td>
                                <select
                                  className="opbill-item-select"
                                  value={item.serviceId}
                                  onChange={(e) => handleItemChange(item.id, 'serviceId', e.target.value)}
                                >
                                  <option value="">Select Service</option>
                                  {Object.entries(
                                    serviceCatalog.reduce((acc, s) => {
                                      if (!acc[s.category]) acc[s.category] = [];
                                      acc[s.category].push(s);
                                      return acc;
                                    }, {})
                                  ).map(([category, services]) => (
                                    <optgroup key={category} label={category}>
                                      {services.map(s => (
                                        <option key={s.id} value={s.id}>
                                          {s.name} — ₹{s.rate}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="opbill-item-input"
                                  value={item.quantity}
                                  min="1"
                                  onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="opbill-item-input"
                                  value={item.rate}
                                  min="0"
                                  onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                  style={{ width: '90px' }}
                                />
                              </td>
                              <td>
                                <span className="opbill-item-amount">₹{(item.rate * item.quantity).toLocaleString()}</span>
                              </td>
                              <td>
                                <button
                                  className="btn-opbill-remove-item"
                                  onClick={() => handleRemoveItem(item.id)}
                                  title="Remove item"
                                  disabled={items.length <= 1}
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button className="btn-opbill-add-item" onClick={handleAddItem} id="btn-add-billing-item">
                      ➕ Add Item
                    </button>

                    {/* Summary */}
                    <div className="opbill-section-title mt-4">
                      <span>📊</span> Bill Summary
                    </div>
                    <div className="opbill-summary-card">
                      <div className="opbill-summary-row">
                        <span>Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span>
                        <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="opbill-summary-row discount-row">
                        <div className="opbill-discount-input-row">
                          <span>Discount</span>
                          <input
                            type="number"
                            className="opbill-discount-input"
                            value={discountPercent}
                            min="0"
                            max="100"
                            onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                            id="opbill-discount-input"
                          />
                          <span>%</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>- ₹{discountAmount.toLocaleString()}</span>
                      </div>
                      <hr className="opbill-summary-divider" />
                      <div className="opbill-summary-row total-row">
                        <span>Total Payable</span>
                        <span>₹{total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="opbill-section-title">
                      <span>💳</span> Payment Method
                    </div>
                    <div className="opbill-payment-grid">
                      {paymentMethods.map(method => (
                        <div
                          key={method.id}
                          className={`opbill-payment-option ${paymentMethod === method.id ? 'active' : ''}`}
                          onClick={() => setPaymentMethod(method.id)}
                          id={`payment-${method.id}`}
                        >
                          <span className="opbill-payment-icon">{method.icon}</span>
                          <span className="opbill-payment-label">{method.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    <div className="opbill-section-title">
                      <span>📝</span> Additional Notes
                    </div>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions, insurance details, or remarks..."
                      className="opbill-form-control"
                      id="opbill-notes"
                    />

                    {submitError && (
                      <Alert variant="danger" className="mt-3">
                        ⚠️ {submitError}
                      </Alert>
                    )}

                    {/* Submit */}
                    <div className="opbill-submit-wrapper">
                      <button className="btn-opbill-draft" onClick={() => navigate(backPath)} id="btn-cancel-bill" disabled={isSubmitting}>
                        ✕ Cancel
                      </button>
                      <button className="btn-opbill-submit" onClick={handleSubmit} id="btn-generate-invoice" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating Invoice in DB...
                          </>
                        ) : (
                          `🧾 Generate Invoice — ₹${total.toLocaleString()}`
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Invoice Success */}
                {invoiceGenerated && (
                  <div className="opbill-success-card">
                    <div className="opbill-success-icon">✅</div>
                    <div className="opbill-success-title">Invoice Generated & Recorded in Database!</div>
                    <div className="opbill-success-invoice">{invoiceNumber}</div>
                    <div className="opbill-success-amount">
                      Total: ₹{(billResult?.totalAmount || total).toLocaleString()} • Status: <strong style={{ color: '#059669' }}>{billResult?.paymentStatus || 'PAID'}</strong> via {paymentMethods.find(m => m.id === paymentMethod)?.label}
                    </div>
                    {billResult?.createdAt && (
                      <div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>
                        Timestamp: {new Date(billResult.createdAt).toLocaleString()}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      <button className="btn-opbill-print" id="btn-print-invoice" onClick={() => window.print()}>
                        🖨️ Print Invoice
                      </button>
                      <button className="btn-opbill-submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }} onClick={() => navigate(backPath)} id="btn-new-bill">
                        ➕ New Bill
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BillingDetail;
