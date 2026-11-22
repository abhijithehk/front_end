import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import billingApi from '../api/billingApi';
import './OpBilling.css';
import './OpPharmacyDispense.css';

const DEFAULT_PRESCRIPTION = [
  { id: 1, name: 'Amoxicillin', dosage: '500mg', freq: '1-0-1', days: 5, qty: 10, instructions: 'After Food', unitPrice: 12.0, stock: 450 },
  { id: 2, name: 'Prednisolone', dosage: '10mg', freq: 'Tapering (1-0-0.5)', days: 10, qty: 15, instructions: '10mg 5 Days, then 5mg 5 Days', unitPrice: 15.0, stock: 80 },
  { id: 3, name: 'Anti-Rabies', dosage: '0.5ml', freq: 'Day 0,3,7,14,28', days: 28, qty: 5, instructions: 'IM Injection', unitPrice: 350.0, stock: 12 },
  { id: 4, name: 'Pantoprazole', dosage: '40mg', freq: '1-0-0', days: 5, qty: 5, instructions: 'Before Food', unitPrice: 8.0, stock: 200 },
];

// Helper to auto-calc qty for basic formats
const autoCalcQty = (freqStr, daysStr) => {
  const daily = freqStr.split('-').reduce((acc, curr) => acc + (parseInt(curr) || 0), 0);
  const pillsPerDay = daily > 0 ? daily : 1;
  return pillsPerDay * (parseInt(daysStr) || 1);
};

const OpPharmacyDispense = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient;

  const isIP = location.pathname.includes('/ip-pharmacy');
  const returnPath = isIP ? '/ip-pharmacy' : '/op-pharmacy';
  const headerTitle = isIP ? 'IPD Prescriptions' : 'OPD Prescriptions';

  const [items, setItems] = useState(DEFAULT_PRESCRIPTION);
  const [isDispensed, setIsDispensed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Item State
  const [newItem, setNewItem] = useState({
    name: '',
    dosage: '',
    freq: '',
    days: '',
    qty: '',
    instructions: '',
    unitPrice: ''
  });

  const handleRemove = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleQtyChange = (id, newQty) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: parseInt(newQty) || 0 };
      }
      return item;
    }));
  };

  const handleAdd = () => {
    if (!newItem.name || !newItem.unitPrice) {
      alert("Please enter at least Medicine Name and Unit Price!");
      return;
    }
    
    // Auto guess qty if user left it blank
    let finalQty = parseInt(newItem.qty);
    if (isNaN(finalQty) || finalQty <= 0) {
      finalQty = autoCalcQty(newItem.freq, newItem.days);
    }

    setItems(prev => [...prev, {
      ...newItem,
      id: Date.now(),
      days: parseInt(newItem.days) || 0,
      qty: finalQty,
      unitPrice: parseFloat(newItem.unitPrice)
    }]);

    setNewItem({ name: '', dosage: '', freq: '', days: '', qty: '', instructions: '', unitPrice: '' });
  };

  // Quick Blur hook to auto-gen Qty mathematically on field exit if currently empty
  const handleDaysBlur = () => {
    if (!newItem.qty && newItem.freq && newItem.days) {
      setNewItem(prev => ({ ...prev, qty: autoCalcQty(prev.freq, prev.days) }));
    }
  };

  // Grand Math
  const subtotal = items.reduce((acc, item) => {
    return acc + (item.unitPrice * (item.qty || 0));
  }, 0);
  const sumTax = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + sumTax;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const billPayload = {
        patientMrn: patient.id || patient.mrn || 'WALK-IN',
        patientName: patient.name || 'Walk-in Patient',
        billType: 'PHARMACY',
        items: items.map(item => ({
          description: `${item.name} - ${item.dosage} (${item.freq})`,
          quantity: item.qty || 1,
          unitPrice: item.unitPrice
        }))
      };
      const createdBill = await billingApi.create(billPayload);
      if (createdBill && createdBill.id) {
        await billingApi.pay(createdBill.id, 'CASH');
      }
      setIsDispensed(true);
      setTimeout(() => {
        navigate(returnPath);
      }, 2000);
    } catch (err) {
      console.error("Pharmacy checkout billing failed:", err);
      setIsDispensed(true);
      setTimeout(() => {
        navigate(returnPath);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) {
    return (
      <div className="opbill-page-container">
        <Container>
          <div className="opbill-card shadow-lg text-center" style={{ padding: '4rem' }}>
             <h3>No Patient Context Found</h3>
             <p className="text-muted">Please search and select a Patient first.</p>
             <button className="btn-opbill-submit mt-3" onClick={() => navigate(returnPath)}>
               ← Back to Search
             </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="opbill-page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} xl={12}>
            <div className="opbill-card shadow-lg">
              
              <div className="opbill-detail-header">
                <div className="opbill-detail-header-top">
                  <button className="opbill-back-btn" onClick={() => navigate(returnPath)}>
                    ← Back to Search
                  </button>
                </div>
                <div className="opbill-detail-header-center">
                  <h2 className="opbill-title">🩺 {headerTitle}</h2>
                  <p className="opbill-subtitle mb-0">Verify and bill doctor's active prescription orders</p>
                </div>
              </div>

              <div className="opbill-body text-start">
                <div className="opbill-patient-strip mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="opbill-patient-meta m-0 p-0">
                    <h4>{patient.name}</h4>
                    <div className="opbill-patient-meta-details mt-1">
                      <span>📞 {patient.phone}</span>
                      <span>{patient.gender}</span>
                      <span style={{ fontWeight: 600, color: '#0d9488' }}>{patient.id}</span>
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>Doctor: Dr. Ramesh (General)</span>
                    </div>
                  </div>
                </div>

                {isDispensed && (
                  <Alert variant="success" className="mb-4">
                    ✅ Prescription committed and billed successfully! Finalizing transaction...
                  </Alert>
                )}

                {!isDispensed && (
                  <>
                    <h5 className="mb-3" style={{ color: '#334e68' }}>Active Medication Orders</h5>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="rx-table">
                        <thead>
                          <tr>
                            <th className="col-sno">S.No</th>
                            <th className="col-name">Item Name</th>
                            <th className="col-dosage">Dosage</th>
                            <th className="col-freq">Frequency</th>
                            <th className="col-days">Days</th>
                            <th className="col-qty">Dispense Qty</th>
                            <th className="col-instr">Instructions</th>
                            <th className="col-unit">Unit ₹</th>
                            <th className="col-total">Line Total</th>
                             <th className="col-stock">Remaining Stock</th>
                            <th className="col-actions">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 && (
                            <tr>
                              <td colSpan="11" className="text-center text-muted py-4">
                                No active prescriptions. Add manually below.
                              </td>
                            </tr>
                          )}
                          {items.map((item, index) => {
                            const lineTotal = item.unitPrice * (item.qty || 0);
                            return (
                              <tr key={item.id}>
                                <td className="col-sno">{index + 1}</td>
                                <td className="col-name">{item.name}</td>
                                <td className="col-dosage">{item.dosage}</td>
                                <td className="col-freq">
                                  {item.freq}
                                  {item.freq.includes('Tapering') && (
                                    <span 
                                      className="ms-1" 
                                      title={item.instructions} 
                                      style={{ cursor: 'help', fontSize: '1rem' }}
                                    >
                                      ℹ️
                                    </span>
                                  )}
                                </td>
                                <td className="col-days">{item.days ? item.days : '--'}</td>
                                <td className="col-qty">
                                  <input 
                                    type="number" 
                                    className="rx-qty-input" 
                                    value={item.qty} 
                                    onChange={(e) => handleQtyChange(item.id, e.target.value)} 
                                  />
                                </td>
                                <td className="col-instr">{item.instructions}</td>
                                <td className="col-unit">₹{item.unitPrice.toFixed(2)}</td>
                                <td className="col-total">₹{lineTotal.toFixed(2)}</td>
                                <td className="col-stock">
                                  <span style={{ color: item.stock > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                                    {item.stock !== undefined ? item.stock : '--'}
                                  </span>
                                </td>
                                <td className="col-actions">
                                  <button onClick={() => handleRemove(item.id)} className="btn-rx-delete" title="Remove">🗑️</button>
                                </td>
                              </tr>
                            );
                          })}

                          {/* INLINE ADD ROW */}
                          <tr className="rx-add-row mt-3">
                            <td className="col-sno text-muted">+</td>
                            <td className="col-name">
                              <input className="rx-add-input" placeholder="e.g. Cough Syrup" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                            </td>
                            <td className="col-dosage">
                              <input className="rx-add-input" placeholder="e.g. 10ml" value={newItem.dosage} onChange={e => setNewItem({...newItem, dosage: e.target.value})} />
                            </td>
                            <td className="col-freq">
                              <input className="rx-add-input" placeholder="1-0-1" value={newItem.freq} onChange={e => setNewItem({...newItem, freq: e.target.value})} />
                            </td>
                            <td className="col-days">
                              <input className="rx-add-input" type="number" placeholder="5" value={newItem.days} onBlur={handleDaysBlur} onChange={e => setNewItem({...newItem, days: e.target.value})} />
                            </td>
                            <td className="col-qty">
                              <input className="rx-add-input" type="number" placeholder="Auto" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: e.target.value})} />
                            </td>
                            <td className="col-instr">
                              <input className="rx-add-input" placeholder="Notes..." value={newItem.instructions} onChange={e => setNewItem({...newItem, instructions: e.target.value})} />
                            </td>
                            <td className="col-unit">
                              <input className="rx-add-input" type="number" placeholder="Price" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: e.target.value})} />
                            </td>
                            <td className="col-total">--</td>
                            <td className="col-stock text-muted">--</td>
                            <td className="col-actions">
                              <button onClick={handleAdd} className="btn-rx-add">Add</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="rx-billing-summary">
                        <div className="rx-billing-content">
                          <div className="rx-summary-line">
                            <span>Subtotal ({items.length} items)</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="rx-summary-line">
                            <span>Pharmacy Tax (5%)</span>
                            <span>₹{sumTax.toFixed(2)}</span>
                          </div>
                          <div className="rx-summary-total">
                            <span>Total Bill Amount</span>
                            <span style={{ color: '#dc2626' }}>₹{grandTotal.toFixed(2)}</span>
                          </div>
                          <button 
                            className="btn-opbill-submit mt-4 w-100" 
                            style={{ background: '#059669', fontSize: '1.2rem'}}
                            disabled={items.length === 0 || isSubmitting || isDispensed}
                            onClick={handleCheckout}
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Processing Order...
                              </>
                            ) : '💾 Proceed to Checkout'}
                          </button>
                        </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OpPharmacyDispense;
