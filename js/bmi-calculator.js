document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const metricRadio = document.getElementById('metric-radio');
    const imperialRadio = document.getElementById('imperial-radio');
    const metricInputs = document.getElementById('metric-inputs');
    const imperialInputs = document.getElementById('imperial-inputs');
    const heightCm = document.getElementById('height-cm');
    const weightKg = document.getElementById('weight-kg');
    const heightFeet = document.getElementById('height-feet');
    const heightInches = document.getElementById('height-inches');
    const weightLbs = document.getElementById('weight-lbs');
    const age = document.getElementById('age');
    const maleRadio = document.getElementById('male-radio');
    const femaleRadio = document.getElementById('female-radio');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultSection = document.getElementById('result-section');
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    const bmiInterpretation = document.getElementById('bmi-interpretation');
    const bmiScale = document.getElementById('bmi-scale');
    const bmiPointer = document.getElementById('bmi-pointer');
    const saveBtn = document.getElementById('save-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historySection = document.getElementById('history-section');

    // Initialize
    init();

    function init() {
        // Load BMI history from localStorage
        loadHistory();
        
        // Setup event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Unit system toggle
        metricRadio.addEventListener('change', toggleUnitSystem);
        imperialRadio.addEventListener('change', toggleUnitSystem);
        
        // Calculate button
        calculateBtn.addEventListener('click', calculateBMI);
        
        // Reset button
        resetBtn.addEventListener('click', resetForm);
        
        // Save button
        saveBtn.addEventListener('click', saveBMIResult);
        
        // Clear history button
        clearHistoryBtn.addEventListener('click', clearHistory);
        
        // Input validation for numeric fields
        const numericInputs = [heightCm, weightKg, heightFeet, heightInches, weightLbs, age];
        numericInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9.]/g, '');
            });
        });
    }

    function toggleUnitSystem() {
        if (metricRadio.checked) {
            metricInputs.classList.remove('d-none');
            imperialInputs.classList.add('d-none');
        } else {
            metricInputs.classList.add('d-none');
            imperialInputs.classList.remove('d-none');
        }
    }

    function calculateBMI() {
        let height, weight, bmi;
        
        // Get values based on selected unit system
        if (metricRadio.checked) {
            height = parseFloat(heightCm.value) / 100; // Convert cm to meters
            weight = parseFloat(weightKg.value);
            
            // Validate inputs
            if (!height || !weight || height <= 0 || weight <= 0) {
                showError('Please enter valid height and weight values');
                return;
            }
            
            // Calculate BMI using metric formula: weight (kg) / [height (m)]²
            bmi = weight / (height * height);
        } else {
            const feet = parseFloat(heightFeet.value) || 0;
            const inches = parseFloat(heightInches.value) || 0;
            height = feet * 12 + inches; // Convert to total inches
            weight = parseFloat(weightLbs.value);
            
            // Validate inputs
            if (!height || !weight || height <= 0 || weight <= 0) {
                showError('Please enter valid height and weight values');
                return;
            }
            
            // Calculate BMI using imperial formula: 703 × weight (lbs) / [height (in)]²
            bmi = 703 * (weight / (height * height));
        }
        
        // Display the result
        displayBMIResult(bmi);
    }

    function displayBMIResult(bmi) {
        // Round BMI to one decimal place
        const roundedBMI = Math.round(bmi * 10) / 10;
        
        // Set BMI value
        bmiValue.textContent = roundedBMI;
        
        // Determine BMI category and interpretation
        const { category, interpretation, color } = getBMICategory(roundedBMI);
        
        // Update result text
        bmiCategory.textContent = category;
        bmiCategory.style.color = color;
        bmiInterpretation.textContent = interpretation;
        
        // Update BMI scale pointer position
        updateBMIScalePointer(roundedBMI);
        
        // Show result section
        resultSection.classList.remove('d-none');
        
        // Scroll to result section
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Enable save button
        saveBtn.disabled = false;
    }

    function getBMICategory(bmi) {
        let category, interpretation, color;
        
        // Get user's age
        const userAge = parseInt(age.value) || 30;
        const isMale = maleRadio.checked;
        
        // Standard BMI categories
        if (bmi < 16) {
            category = 'Severe Thinness';
            interpretation = 'Your BMI suggests severe underweight, which can lead to health issues. Please consult a healthcare professional for guidance.';
            color = '#d9534f'; // Red
        } else if (bmi < 17) {
            category = 'Moderate Thinness';
            interpretation = 'Your BMI indicates moderate underweight. Consider consulting a nutritionist for a healthy weight gain plan.';
            color = '#f0ad4e'; // Orange
        } else if (bmi < 18.5) {
            category = 'Mild Thinness';
            interpretation = 'Your BMI shows you are slightly underweight. Focus on nutrient-rich foods to reach a healthy weight.';
            color = '#5bc0de'; // Light blue
        } else if (bmi < 25) {
            category = 'Normal';
            interpretation = 'Your BMI is within the normal range. Maintain a balanced diet and regular physical activity to stay healthy.';
            color = '#5cb85c'; // Green
        } else if (bmi < 30) {
            category = 'Overweight';
            interpretation = 'Your BMI indicates overweight. Consider making dietary adjustments and increasing physical activity.';
            color = '#f0ad4e'; // Orange
        } else if (bmi < 35) {
            category = 'Obese Class I';
            interpretation = 'Your BMI suggests moderate obesity. It\'s recommended to consult a healthcare provider for weight management advice.';
            color = '#d9534f'; // Red
        } else if (bmi < 40) {
            category = 'Obese Class II';
            interpretation = 'Your BMI indicates severe obesity. Please consult a healthcare professional for a personalized weight management plan.';
            color = '#d9534f'; // Darker red
        } else {
            category = 'Obese Class III';
            interpretation = 'Your BMI suggests morbid obesity. It\'s important to seek medical guidance for weight management strategies.';
            color = '#d9534f'; // Darkest red
        }
        
        // Age and gender specific adjustments to interpretation
        if (userAge > 65) {
            interpretation += ' Note that BMI may be less accurate for older adults who tend to have more body fat.';
        }
        
        if (userAge < 18) {
            interpretation += ' For children and teens, BMI is age and gender specific. Please consult with a pediatrician for proper assessment.';
        }
        
        if (isMale && bmi < 20) {
            interpretation += ' Men typically have less body fat than women, so a slightly lower BMI might still be healthy.';
        }
        
        if (!isMale && bmi < 19) {
            interpretation += ' Women generally have more body fat than men, which is normal and healthy.';
        }
        
        return { category, interpretation, color };
    }

    function updateBMIScalePointer(bmi) {
        // BMI scale range for display purposes
        const minBMI = 15;
        const maxBMI = 40;
        
        // Calculate position percentage (clamped between 0-100%)
        let positionPercent = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;
        positionPercent = Math.max(0, Math.min(100, positionPercent));
        
        // Set pointer position
        bmiPointer.style.left = `${positionPercent}%`;
        
        // Set color based on BMI category
        let pointerColor;
        if (bmi < 18.5) pointerColor = '#5bc0de'; // Underweight - blue
        else if (bmi < 25) pointerColor = '#5cb85c'; // Normal - green
        else if (bmi < 30) pointerColor = '#f0ad4e'; // Overweight - orange
        else pointerColor = '#d9534f'; // Obese - red
        
        bmiPointer.style.backgroundColor = pointerColor;
    }

    function showError(message) {
        alert(message);
    }

    function resetForm() {
        // Reset all input fields
        heightCm.value = '';
        weightKg.value = '';
        heightFeet.value = '';
        heightInches.value = '';
        weightLbs.value = '';
        age.value = '';
        
        // Reset radio buttons to default
        metricRadio.checked = true;
        maleRadio.checked = true;
        
        // Toggle unit system to match
        toggleUnitSystem();
        
        // Hide result section
        resultSection.classList.add('d-none');
        
        // Disable save button
        saveBtn.disabled = true;
    }

    function saveBMIResult() {
        const currentResult = {
            date: new Date().toLocaleDateString(),
            bmi: parseFloat(bmiValue.textContent),
            category: bmiCategory.textContent,
            weight: metricRadio.checked ? `${weightKg.value} kg` : `${weightLbs.value} lbs`,
            height: metricRadio.checked ? `${heightCm.value} cm` : `${heightFeet.value}' ${heightInches.value}"`,
            gender: maleRadio.checked ? 'Male' : 'Female',
            age: age.value
        };
        
        // Get existing history from localStorage
        let bmiHistory = JSON.parse(localStorage.getItem('bmiHistory')) || [];
        
        // Add new result to history
        bmiHistory.unshift(currentResult);
        
        // Limit history to 10 entries
        if (bmiHistory.length > 10) {
            bmiHistory = bmiHistory.slice(0, 10);
        }
        
        // Save updated history
        localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));
        
        // Update history display
        updateHistoryDisplay(bmiHistory);
        
        // Show history section if hidden
        historySection.classList.remove('d-none');
        
        // Provide feedback
        saveBtn.innerHTML = '<i class="fas fa-check me-2"></i>Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Result';
        }, 2000);
    }

    function loadHistory() {
        const bmiHistory = JSON.parse(localStorage.getItem('bmiHistory')) || [];
        
        if (bmiHistory.length > 0) {
            updateHistoryDisplay(bmiHistory);
            historySection.classList.remove('d-none');
        }
    }

    function updateHistoryDisplay(history) {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<li class="list-group-item">No saved BMI results yet.</li>';
            return;
        }
        
        history.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            let categoryColor;
            if (item.category.includes('Thinness')) categoryColor = '#5bc0de';
            else if (item.category === 'Normal') categoryColor = '#5cb85c';
            else if (item.category === 'Overweight') categoryColor = '#f0ad4e';
            else categoryColor = '#d9534f';
            
            listItem.innerHTML = `
                <div>
                    <span class="fw-bold">${item.date}</span>
                    <span class="badge bg-primary rounded-pill ms-2">${item.bmi}</span>
                    <span class="badge rounded-pill ms-2" style="background-color: ${categoryColor}">${item.category}</span>
                    <div class="small text-muted mt-1">Height: ${item.height} | Weight: ${item.weight} | Age: ${item.age} | Gender: ${item.gender}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger delete-history-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            historyList.appendChild(listItem);
            
            // Add event listener to delete button
            const deleteBtn = listItem.querySelector('.delete-history-btn');
            deleteBtn.addEventListener('click', (e) => {
                const itemIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                deleteHistoryItem(itemIndex);
            });
        });
    }

    function deleteHistoryItem(index) {
        let bmiHistory = JSON.parse(localStorage.getItem('bmiHistory')) || [];
        
        // Remove item at specified index
        bmiHistory.splice(index, 1);
        
        // Save updated history
        localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));
        
        // Update history display
        updateHistoryDisplay(bmiHistory);
        
        // Hide history section if empty
        if (bmiHistory.length === 0) {
            historySection.classList.add('d-none');
        }
    }

    function clearHistory() {
        // Clear BMI history from localStorage
        localStorage.removeItem('bmiHistory');
        
        // Clear history display
        historyList.innerHTML = '<li class="list-group-item">No saved BMI results yet.</li>';
        
        // Hide history section
        historySection.classList.add('d-none');
    }
}); 