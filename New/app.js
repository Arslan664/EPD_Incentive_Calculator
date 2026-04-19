// Depends on comprehensiveData from comprehensive_data.js

document.addEventListener('DOMContentLoaded', () => {
    
    if (!typeof comprehensiveData !== "undefined" && !comprehensiveData || comprehensiveData.length === 0) {
        console.error("No data found");
        return;
    }

    // Augment data with Mock Country/Year for the filter's sake
    const augmentedData = comprehensiveData.map((d, index) => {
        return {
            ...d,
            Country: index % 3 === 0 ? "Kazakhstan" : "Georgia",
            Year: index < 50 ? "2017" : "2018",
            Quarter: index % 2 === 0 ? "Q1" : "Q2"
        };
    });

    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const emptyState = document.getElementById('empty-state');
    
    // Filter selectors
    const filterCountry = document.getElementById('filter-country');
    const filterYear = document.getElementById('filter-year');
    const filterQuarter = document.getElementById('filter-quarter');
    const filterTeam = document.getElementById('filter-team');
    const filterRep = document.getElementById('filter-rep');
    const filterView = document.getElementById('filter-view');
    const resetBtn = document.getElementById('reset-btn');

    // Populate dropdowns function
    const populateDropdown = (element, key) => {
        const uniqueValues = [...new Set(augmentedData.map(d => d[key]).filter(v => v))].sort();
        uniqueValues.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            element.appendChild(opt);
        });
    };

    populateDropdown(filterCountry, 'Country');
    populateDropdown(filterYear, 'Year');
    populateDropdown(filterQuarter, 'Quarter');
    populateDropdown(filterTeam, 'PromoLine');
    populateDropdown(filterRep, 'Name');

    const cleanNum = (str) => {
        if(!str) return 0;
        return parseFloat(str.toString().replace(/,/g, '').replace(/\s/g, '')) || 0;
    };

    const formatNum = (num) => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(num);
    };

    const getPctHelper = (act, plan) => {
        if (!plan || plan === 0) return "";
        const pct = Math.round((act / plan) * 100);
        const className = pct >= 100 ? 'pct-good' : 'pct-bad';
        return `<span class="percent-badge ${className}">${pct}%</span>`;
    };

    // RENDER DETAILED PERFORMANCE VIEW
    const renderDetailedView = (data) => {
        tableHead.innerHTML = `
            <tr>
                <th>Rep Name</th>
                <th>Position & Team</th>
                <th>Total Plan (LC)</th>
                <th>Total Actual (LC)</th>
                <th>Product Breakdown (Act vs Plan)</th>
                <th>TCFA (Actual)</th>
                <th>Target Base (LC)</th>
                <th class="highlight-col">Final Incentive (LC)</th>
            </tr>
        `;

        data.forEach(d => {
            const tr = document.createElement('tr');
            
            const tdName = document.createElement('td');
            tdName.innerHTML = `<span class="rep-name">${d.Name}</span><span style="font-size: 0.85rem; color: #64748b;">${d.Position || 'Rep'} | ${d.Country}</span>`;
            
            const tdTeam = document.createElement('td');
            tdTeam.innerHTML = `<span class="team-badge">${d.PromoLine || 'Unknown'}</span><br><span style="font-size: 0.75rem; color: #94a3b8; margin-top:4px; display:inline-block;">${d.Quarter} ${d.Year}</span>`;

            const tAct = cleanNum(d.TotalAct);
            const tPlan = cleanNum(d.TotalPlan);
            
            const tdPlan = document.createElement('td');
            tdPlan.innerHTML = `<div class="val-plan">${formatNum(tPlan)}</div>`;
            const tdAct = document.createElement('td');
            tdAct.innerHTML = `<div class="val-act">${formatNum(tAct)}</div>${getPctHelper(tAct, tPlan)}`;

            const tdProd = document.createElement('td');
            let prodHtml = '<div class="prod-list">';
            const prods = [
                { name: d.P1Name, act: d.P1Act, plan: d.P1Plan },
                { name: d.P2Name, act: d.P2Act, plan: d.P2Plan },
                { name: d.P3Name, act: d.P3Act, plan: d.P3Plan }
            ];
            prods.forEach(p => {
                if (cleanNum(p.plan) > 0 || cleanNum(p.act) > 0) {
                    const pact = cleanNum(p.act);
                    const pplan = cleanNum(p.plan);
                    prodHtml += `<div class="prod-item"><span class="prod-name" title="${p.name}">${p.name || 'Product'}</span><span>${formatNum(pact)} / ${formatNum(pplan)} ${getPctHelper(pact, pplan)}</span></div>`;
                }
            });
            prodHtml += '</div>';
            tdProd.innerHTML = prodHtml;

            const tdTCFA = document.createElement('td');
            const tcfaVal = (d.TCFA_Act || "0%");
            const tcfaNum = parseFloat(tcfaVal.replace('%', ''));
            const tcfaClass = tcfaNum >= 95 ? 'pct-good' : 'pct-bad'; // Assuming 95% is a standard target for green
            tdTCFA.innerHTML = `<span class="percent-badge ${tcfaClass}" style="font-size:0.9rem; padding:6px 10px;">${tcfaVal}</span>`;

            const tarBase = cleanNum(d.TargetBase_Sum || d.TotalTarget);
            const tdBase = document.createElement('td');
            tdBase.innerHTML = `<div class="val-plan">${formatNum(tarBase)}</div>`;

            const tarInc = cleanNum(d.TotalIncentive_Sum || d.TotalIncentive);
            const tdInc = document.createElement('td');
            tdInc.className = 'highlight-col';
            tdInc.innerHTML = `<div class="final-incentive">${formatNum(tarInc)}</div>`;

            tr.append(tdName, tdTeam, tdPlan, tdAct, tdProd, tdTCFA, tdBase, tdInc);
            tableBody.appendChild(tr);
        });
    };

    // RENDER SUMMARY CALCULATION (FINANCIALS) VIEW
    const renderSummaryView = (data) => {
        tableHead.innerHTML = `
            <tr>
                <th>No</th>
                <th>Name</th>
                <th>Position</th>
                <th>Target Incentive for Quarter, LC</th>
                <th>Reimbursable months, %</th>
                <th>Target Base, LC</th>
                <th>Target Inc (Sales Result)</th>
                <th>Product 1</th>
                <th>Product 2</th>
                <th>Product 3</th>
                <th>Product 4</th>
                <th>Inc Amount (Sales Result)</th>
                <th>Target Inc (TCFA)</th>
                <th>Target Inc (Coaching)</th>
                <th>Inc Amount (TCFA)</th>
                <th>Inc Amount (Coaching)</th>
                <th>Amount Field Work</th>
                <th class="highlight-col">Total Incentive, LC</th>
            </tr>
        `;

        data.forEach((d, i) => {
            const tr = document.createElement('tr');
            
            // Replicate exactly the Excel logic shown in the screenshot
            const html = `
                <td>${d.Id_Sum || (i+1)}</td>
                <td style="white-space:nowrap; font-weight:600; color:var(--primary);">${d.Name}</td>
                <td style="white-space:nowrap;">${d.Position || ''}</td>
                <td>${formatNum(cleanNum(d.TargetForQuarter_Sum))}</td>
                <td>${d.ReimbursableMonths_Sum}</td>
                <td>${formatNum(cleanNum(d.TargetBase_Sum))}</td>
                <td>${formatNum(cleanNum(d.TargetSalesResult_Sum))}</td>
                <td>${formatNum(cleanNum(d.Product1_Sum))}</td>
                <td>${formatNum(cleanNum(d.Product2_Sum))}</td>
                <td>${formatNum(cleanNum(d.Product3_Sum))}</td>
                <td>${formatNum(cleanNum(d.Product4_Sum))}</td>
                <td style="background-color:#f1f5f9; font-weight:600;">${formatNum(cleanNum(d.IncSalesResult_Sum))}</td>
                <td>${formatNum(cleanNum(d.TargetTCFA_Sum))}</td>
                <td>${formatNum(cleanNum(d.TargetCoaching_Sum))}</td>
                <td>${formatNum(cleanNum(d.IncTCFA_Sum))}</td>
                <td>${formatNum(cleanNum(d.IncCoaching_Sum))}</td>
                <td style="background-color:#f1f5f9; font-weight:600;">${formatNum(cleanNum(d.FieldWork_Sum))}</td>
                <td class="highlight-col" style="font-weight:700;">${formatNum(cleanNum(d.TotalIncentive_Sum))}</td>
            `;
            tr.innerHTML = html;
            tableBody.appendChild(tr);
        });
    };

    const renderTable = (data) => {
        tableBody.innerHTML = '';
        if(data.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        if (filterView.value === 'detailed') {
            renderDetailedView(data);
        } else {
            renderSummaryView(data);
        }
    };

    // Filter Logic
    const applySearchAndFilter = () => {
        let filtered = augmentedData;
        const sVal = searchInput.value.toLowerCase();
        
        if (sVal) {
            filtered = filtered.filter(d => 
                (d.Name && d.Name.toLowerCase().includes(sVal)) || 
                (d.PromoLine && d.PromoLine.toLowerCase().includes(sVal))
            );
        }

        if (filterCountry.value !== 'all') filtered = filtered.filter(d => d.Country === filterCountry.value);
        if (filterYear.value !== 'all') filtered = filtered.filter(d => d.Year === filterYear.value);
        if (filterQuarter.value !== 'all') filtered = filtered.filter(d => d.Quarter === filterQuarter.value);
        if (filterTeam.value !== 'all') filtered = filtered.filter(d => d.PromoLine === filterTeam.value);
        if (filterRep.value !== 'all') filtered = filtered.filter(d => d.Name === filterRep.value);

        renderTable(filtered);
    };

    // Event Listeners
    searchInput.addEventListener('input', applySearchAndFilter);
    filterCountry.addEventListener('change', applySearchAndFilter);
    filterYear.addEventListener('change', applySearchAndFilter);
    filterQuarter.addEventListener('change', applySearchAndFilter);
    filterTeam.addEventListener('change', applySearchAndFilter);
    filterRep.addEventListener('change', applySearchAndFilter);
    filterView.addEventListener('change', applySearchAndFilter); // Repaint with new table headers

    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterCountry.value = 'all';
        filterYear.value = 'all';
        filterQuarter.value = 'all';
        filterTeam.value = 'all';
        filterRep.value = 'all';
        filterView.value = 'detailed';
        applySearchAndFilter();
    });

    // Initial load
    renderTable(augmentedData);
});
