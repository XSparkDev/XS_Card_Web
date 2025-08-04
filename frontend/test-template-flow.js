#!/usr/bin/env node

// Template-Employee Flow Test Script
const API_BASE_URL = 'http://localhost:8383';
const FIREBASE_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjJiN2JhZmIyZjEwY2FlMmIxZjA3ZjM4MTZjNTQyMmJlY2NhNWMyMjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzU0MzA4MDExLCJ1c2VyX2lkIjoiWDh6aThhdlQ1T2RQSDBsYkNxN3E0ODJmWU91MSIsInN1YiI6Ilg4emk4YXZUNU9kUEgwbGJDcTdxNDgyZllPdTEiLCJpYXQiOjE3NTQzMDgwMTEsImV4cCI6MTc1NDMxMTYxMSwiZW1haWwiOiJ4YXBheWk5NTY3QGNvdXJzb3JhLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInhhcGF5aTk1NjdAY291cnNvcmEuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.Y18knD3unbWKcwhe6NHtpKFPAFhyYyDF3mExgkKG9qYq3WUSD54MyPyfODYxYiVFHvCSJApZEumB9acXPjtkIJ4IPErXkTCUadg72Y9nOffymvYS_4Caf-tyumXOnvyUcZcAqSKAeCIBmkhomfmVYqLmAVkzUpVee2VeYs_Eki3ukIbZCTkTdHktovf634el9WE9Ay-MjjxLcUy2hv1yJBvZXbMS6okVAjkkTCnVq_IOjc-s3di6As05uBUwUXNjRNXCUMjLZu2dX8ZfhhzAdPtfiIgSVKl93_rbj8_xhTPIBPDYZwWN8xMDcriwV0u2eQkusahydJiVUgsR8Sg9ng';
const ENTERPRISE_ID = 'x-spark-test';

// Global variables
let createdTemplateId = null;
let selectedDepartmentId = null;
let createdEmployeeId = null;
let departments = [];

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const typeIcon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${typeIcon} ${message}`);
}

function logJson(obj, label = 'Data') {
    console.log(`\n📄 ${label}:`);
    console.log(JSON.stringify(obj, null, 2));
    console.log('');
}

async function makeRequest(url, options = {}) {
    const defaultHeaders = {
        'Authorization': `Bearer ${FIREBASE_TOKEN}`,
        'Content-Type': 'application/json'
    };
    
    const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
        responseData = JSON.parse(responseText);
    } catch (e) {
        responseData = responseText;
    }
    
    return { response, data: responseData };
}

// Test functions
async function step1_fetchDepartments() {
    log('🏢 STEP 1: Fetching departments...');
    
    try {
        const url = `${API_BASE_URL}/api/enterprise/${ENTERPRISE_ID}/departments`;
        log(`Request URL: ${url}`);
        
        const { response, data } = await makeRequest(url);
        
        log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        logJson(data, 'Departments Response');
        
        if (data.departments && Array.isArray(data.departments)) {
            departments = data.departments;
            log(`✅ Found ${departments.length} departments`, 'success');
            
            departments.forEach((dept, index) => {
                log(`  ${index + 1}. ${dept.name} (ID: ${dept.id})`);
            });
            
            // Select first department for testing
            if (departments.length > 0) {
                selectedDepartmentId = departments[0].id;
                log(`🎯 Selected department for testing: ${departments[0].name} (${selectedDepartmentId})`, 'info');
            }
            
            return true;
        } else {
            throw new Error('Invalid departments response format');
        }
        
    } catch (error) {
        log(`❌ Error fetching departments: ${error.message}`, 'error');
        return false;
    }
}

async function step2_createTemplate() {
    log('🎨 STEP 2: Creating template...');
    
    if (!selectedDepartmentId) {
        log('❌ No department selected', 'error');
        return false;
    }
    
    const templateData = {
        name: 'Test Sales Template',
        description: 'A test template for sales department with red color scheme',
        colorScheme: '#E63946',
        departmentId: selectedDepartmentId,
        enterpriseId: ENTERPRISE_ID,
        scope: 'department',
        companyLogo: null
    };
    
    log(`Creating template for department: ${selectedDepartmentId}`);
    logJson(templateData, 'Template Data');
    
    try {
        const { response, data } = await makeRequest(`${API_BASE_URL}/api/templates`, {
            method: 'POST',
            body: JSON.stringify(templateData)
        });
        
        log(`Response status: ${response.status}`);
        logJson(data, 'Template Creation Response');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        }
        
        if (data.success && data.data && data.data.id) {
            createdTemplateId = data.data.id;
            log(`✅ Template created successfully! ID: ${createdTemplateId}`, 'success');
            log(`   Name: ${data.data.name}`);
            log(`   Color: ${data.data.colorScheme}`);
            log(`   Department: ${data.data.departmentId}`);
            log(`   Created By: ${data.data.createdByRole}`);
            return true;
        } else {
            throw new Error('Invalid template creation response');
        }
        
    } catch (error) {
        log(`❌ Error creating template: ${error.message}`, 'error');
        return false;
    }
}

async function step3_verifyTemplate() {
    log('🔍 STEP 3: Verifying template...');
    
    if (!createdTemplateId) {
        log('❌ No template ID to verify', 'error');
        return false;
    }
    
    try {
        const { response, data } = await makeRequest(`${API_BASE_URL}/api/templates/template/${createdTemplateId}`);
        
        log(`Response status: ${response.status}`);
        logJson(data, 'Template Verification Response');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (data.success && data.data && data.data.id) {
            log('✅ Template verification: SUCCESS', 'success');
            log(`   Template exists and is accessible`);
            log(`   Template ID: ${data.data.id}`);
            log(`   Template Name: ${data.data.name}`);
            return true;
        } else {
            throw new Error('Template not found or invalid response');
        }
        
    } catch (error) {
        log(`❌ Error verifying template: ${error.message}`, 'error');
        return false;
    }
}

async function step4_testEffectiveTemplate() {
    log('🎯 STEP 4: Testing effective template API...');
    
    if (!selectedDepartmentId) {
        log('❌ No department selected', 'error');
        return false;
    }
    
    try {
        const url = `${API_BASE_URL}/api/templates/${ENTERPRISE_ID}/${selectedDepartmentId}/effective`;
        log(`Request URL: ${url}`);
        
        const { response, data } = await makeRequest(url);
        
        log(`Response status: ${response.status}`);
        logJson(data, 'Effective Template Response');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        }
        
        if (data.success && data.data && data.data.template) {
            log('✅ Effective template API: SUCCESS', 'success');
            log(`   Template ID: ${data.data.template.id}`);
            log(`   Color Scheme: ${data.data.template.colorScheme}`);
            log(`   Source: ${data.data.source}`);
            
            // Verify it's our created template
            if (data.data.template.id === createdTemplateId) {
                log('✅ Correct template returned!', 'success');
            } else {
                log('⚠️ Different template returned than expected', 'warning');
            }
            
            return true;
        } else if (data.fallback) {
            log('⚠️ Using fallback template (no specific template found)', 'warning');
            logJson(data.fallback, 'Fallback Template');
            return 'fallback';
        } else {
            throw new Error('Invalid effective template response');
        }
        
    } catch (error) {
        log(`❌ Error testing effective template API: ${error.message}`, 'error');
        return false;
    }
}

async function step5_createEmployee() {
    log('👤 STEP 5: Creating employee with template...');
    
    if (!selectedDepartmentId) {
        log('❌ No department selected', 'error');
        return false;
    }
    
    // First, fetch the effective template (simulating frontend logic)
    log('🎨 Fetching effective template for employee...');
    const templateUrl = `${API_BASE_URL}/api/templates/${ENTERPRISE_ID}/${selectedDepartmentId}/effective`;
    
    let templateData = {
        colorScheme: '#1B2B5B',
        companyLogo: null
    };
    
    try {
        const { response: templateResponse, data: templateResult } = await makeRequest(templateUrl);
        
        if (templateResponse.ok) {
            logJson(templateResult, 'Template Fetch Result');
            
            if (templateResult.success && templateResult.data && templateResult.data.template) {
                templateData = {
                    colorScheme: templateResult.data.template.colorScheme,
                    companyLogo: templateResult.data.template.companyLogo,
                    templateId: templateResult.data.template.id,
                    templateName: templateResult.data.template.name,
                    templateSource: templateResult.data.source
                };
                log('✅ Template found and will be applied', 'success');
            } else if (templateResult.fallback) {
                templateData = {
                    colorScheme: templateResult.fallback.colorScheme,
                    companyLogo: templateResult.fallback.companyLogo
                };
                log('⚠️ Using fallback template', 'warning');
            }
        } else {
            log('⚠️ Template fetch failed, using defaults', 'warning');
        }
    } catch (error) {
        log(`⚠️ Template fetch error: ${error.message}`, 'warning');
    }
    
    // Create employee with template data
    const employeeData = {
        firstName: 'John',
        lastName: 'TestUser',
        email: 'john.testuser@example.com',
        phone: '+27-87-123-4567',
        position: 'Sales Representative',
        role: 'employee',
        template: templateData
    };
    
    log('Creating employee...');
    logJson(employeeData, 'Employee Data');
    
    try {
        const url = `${API_BASE_URL}/api/enterprise/${ENTERPRISE_ID}/departments/${selectedDepartmentId}/employees`;
        log(`Request URL: ${url}`);
        
        const { response, data } = await makeRequest(url, {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
        
        log(`Response status: ${response.status}`);
        logJson(data, 'Employee Creation Response');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        }
        
        if (data.success && data.employee) {
            createdEmployeeId = data.employee.id;
            log(`✅ Employee created successfully! ID: ${createdEmployeeId}`, 'success');
            log(`   User ID: ${data.employee.userId}`);
            log(`   Name: ${data.employee.name} ${data.employee.surname}`);
            log(`   Email: ${data.employee.email}`);
            return true;
        } else {
            throw new Error('Invalid employee creation response');
        }
        
    } catch (error) {
        log(`❌ Error creating employee: ${error.message}`, 'error');
        return false;
    }
}

async function step6_verifyEmployeeCard() {
    log('🃏 STEP 6: Verifying employee card template...');
    
    if (!createdEmployeeId) {
        log('❌ No employee ID to verify', 'error');
        return false;
    }
    
    try {
        // Fetch employee's business cards
        const url = `${API_BASE_URL}/api/enterprise/${ENTERPRISE_ID}/employees/${createdEmployeeId}/cards`;
        log(`Request URL: ${url}`);
        
        const { response, data } = await makeRequest(url);
        
        log(`Response status: ${response.status}`);
        logJson(data, 'Employee Cards Response');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (data.cards && data.cards.length > 0) {
            const card = data.cards[0]; // Get the first card
            log('✅ Employee card found!', 'success');
            
            // Display card details
            log('\n🃏 EMPLOYEE CARD DETAILS:');
            log(`   Name: ${card.name} ${card.surname}`);
            log(`   Email: ${card.email}`);
            log(`   Position: ${card.occupation}`);
            log(`   Color Scheme: ${card.colorScheme}`);
            log(`   Company: ${card.company}`);
            log(`   Template ID: ${card.templateId || 'null'}`);
            log(`   Template Name: ${card.templateName || 'null'}`);
            log(`   Template Source: ${card.templateSource || 'default'}`);
            
            // Check if template was applied correctly
            if (card.templateId && card.templateId === createdTemplateId) {
                log('🎉 SUCCESS: Employee card has correct template applied!', 'success');
                return true;
            } else if (card.templateSource === 'default') {
                log('⚠️ WARNING: Employee card is using default template', 'warning');
                return 'default';
            } else {
                log('❌ ERROR: Template mismatch or not applied', 'error');
                log(`   Expected template ID: ${createdTemplateId}`);
                log(`   Actual template ID: ${card.templateId}`);
                return false;
            }
            
        } else {
            throw new Error('No cards found for employee');
        }
        
    } catch (error) {
        log(`❌ Error verifying employee card: ${error.message}`, 'error');
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🧪 TEMPLATE-EMPLOYEE FLOW TEST SUITE');
    console.log('=====================================\n');
    
    const results = {};
    
    // Run all test steps
    results.departments = await step1_fetchDepartments();
    console.log('\n' + '='.repeat(50) + '\n');
    
    if (results.departments) {
        results.templateCreation = await step2_createTemplate();
        console.log('\n' + '='.repeat(50) + '\n');
        
        if (results.templateCreation) {
            results.templateVerification = await step3_verifyTemplate();
            console.log('\n' + '='.repeat(50) + '\n');
            
            results.effectiveTemplate = await step4_testEffectiveTemplate();
            console.log('\n' + '='.repeat(50) + '\n');
            
            results.employeeCreation = await step5_createEmployee();
            console.log('\n' + '='.repeat(50) + '\n');
            
            if (results.employeeCreation) {
                results.employeeCardVerification = await step6_verifyEmployeeCard();
                console.log('\n' + '='.repeat(50) + '\n');
            }
        }
    }
    
    // Generate summary
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('========================\n');
    
    const getStatusIcon = (result) => {
        if (result === true) return '✅';
        if (result === false) return '❌';
        if (result === 'fallback' || result === 'default') return '⚠️';
        return '❓';
    };
    
    const getStatusText = (result) => {
        if (result === true) return 'SUCCESS';
        if (result === false) return 'FAILED';
        if (result === 'fallback') return 'FALLBACK';
        if (result === 'default') return 'DEFAULT';
        return 'SKIPPED';
    };
    
    Object.entries(results).forEach(([test, result]) => {
        console.log(`${getStatusIcon(result)} ${test.padEnd(25)} ${getStatusText(result)}`);
    });
    
    // Overall result
    const overallSuccess = Object.values(results).every(result => result === true);
    const hasWarnings = Object.values(results).some(result => result === 'fallback' || result === 'default');
    
    console.log('\n' + '='.repeat(50));
    
    if (overallSuccess) {
        console.log('🎉 OVERALL RESULT: ALL TESTS PASSED');
        console.log('✅ Template system is working correctly!');
    } else if (hasWarnings) {
        console.log('⚠️  OVERALL RESULT: PARTIAL SUCCESS');
        console.log('⚠️  Some issues detected, but core functionality works');
    } else {
        console.log('❌ OVERALL RESULT: TESTS FAILED');
        console.log('❌ Template system needs attention');
    }
    
    console.log('\n🔗 Created Resources:');
    if (createdTemplateId) console.log(`   Template ID: ${createdTemplateId}`);
    if (createdEmployeeId) console.log(`   Employee ID: ${createdEmployeeId}`);
    if (selectedDepartmentId) console.log(`   Department ID: ${selectedDepartmentId}`);
}

// Handle fetch for Node.js if needed
if (typeof fetch === 'undefined') {
    console.log('⚠️  This script requires a fetch-compatible environment');
    console.log('   Run in browser console or use Node.js with node-fetch');
    process.exit(1);
}

// Run the tests
runTests().catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
});