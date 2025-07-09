export function initializeSlotInfo() {
    const slotInfoContainer = document.getElementById('slot-info-container');
    slotInfoContainer.style.position = 'absolute';
    slotInfoContainer.style.left = '10px';
    slotInfoContainer.style.top = '10px';
    slotInfoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    slotInfoContainer.style.color = 'white';
    slotInfoContainer.style.padding = '20px';
    slotInfoContainer.style.width = '240px';
    slotInfoContainer.style.borderRadius = '12px';
    slotInfoContainer.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';

    slotInfoContainer.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 20px; font-size: 1.2em;">Slot Parkir <span id="slot-count" style="color: #00ff00;">(0/20)</span></h3>
        <div id="slot-grid" style="display: grid; grid-template-columns: repeat(5, 40px); grid-template-rows: repeat(4, 40px); grid-gap: 10px;"></div>
    `;

    // const historyContainer = document.getElementById('history-container');
    // historyContainer.style.position = 'absolute';
    // historyContainer.style.left = '10px';
    // historyContainer.style.top = '320px'; // Mengatur jarak dari slot info container
    // historyContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    // historyContainer.style.color = 'white';
    // historyContainer.style.padding = '20px';
    // historyContainer.style.width = '240px';
    // historyContainer.style.borderRadius = '12px';
    // historyContainer.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';

    // historyContainer.innerHTML = `
    //     <h4 style="text-align: center; margin-bottom: 10px; font-size: 1.1em;">History Penggunaan</h4>
    //     <div id="slot-history" style="max-height: 120px; overflow-y: auto; background-color: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px;"></div>
    // `;

    const db = firebase.database();
    db.ref('slot_parking').on('value', (snapshot) => {
        const slots = snapshot.val();
        updateSlotInfo(slots);
    });

    db.ref('history').on('value', (snapshot) => {
        const historyData = snapshot.val();
        updateSlotHistory(historyData);
    });
}

function updateSlotInfo(slots) {
    const slotGrid = document.getElementById('slot-grid');
    slotGrid.innerHTML = '';  

    let occupiedCount = 0;

    for (let i = 1; i <= 20; i++) {
        const slot = `slot_${i}`;
        const status = slots[slot] ? 'Terisi' : 'Kosong';
        if (slots[slot]) {
            occupiedCount++;
        }

        const slotElement = document.createElement('div');
        slotElement.style.position = 'relative';
        slotElement.style.width = '40px';
        slotElement.style.height = '40px';
        slotElement.style.backgroundImage = `url('../assets/icar.png')`;
        slotElement.style.backgroundSize = 'cover';
        slotElement.style.backgroundRepeat = 'no-repeat';
        slotElement.style.backgroundPosition = 'center';
        slotElement.style.opacity = slots[slot] ? '1' : '0.3';
        slotElement.style.borderRadius = '8px';
        slotElement.style.transition = 'transform 0.2s, box-shadow 0.2s';

        // Menambahkan keterangan nomor slot
        const slotLabel = document.createElement('span');
        slotLabel.textContent = `Slot ${i}`;
        slotLabel.style.position = 'absolute';
        slotLabel.style.bottom = '0';
        slotLabel.style.left = '50%';
        slotLabel.style.transform = 'translateX(-50%)';
        slotLabel.style.fontSize = '0.7em';
        slotLabel.style.color = 'white';
        slotLabel.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
        slotLabel.style.pointerEvents = 'none';

        slotElement.appendChild(slotLabel);

        slotElement.addEventListener('mouseover', () => {
            slotElement.style.transform = 'scale(1.1)';
            slotElement.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
        });

        slotElement.addEventListener('mouseout', () => {
            slotElement.style.transform = 'scale(1)';
            slotElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });

        slotGrid.appendChild(slotElement);
    }

    const slotCount = document.getElementById('slot-count');
    slotCount.textContent = `(${occupiedCount}/20)`;
    slotCount.style.color = occupiedCount === 20 ? '#ff4c4c' : '#00ff00';
}

// function countOccupiedSlots(slotHistory) {
//     let count = 0;
    
//     // Iterasi setiap entry dalam history slot
//     for (const [timestamp, status] of Object.entries(slotHistory)) {
//         if (status === 'terisi') {
//             count++;
//         }
//     }
    
//     return count;
// }

// function updateSlotHistory(historyData) {
//     const historyContainer = document.getElementById('slot-history');
//     historyContainer.innerHTML = '';  

//     if (historyData) {
//         // Buat array untuk menyimpan data slot yang terurut
//         const sortedSlots = Object.keys(historyData).sort((a, b) => {
//             const aNumber = parseInt(a.split('_')[1]);
//             const bNumber = parseInt(b.split('_')[1]);
//             return aNumber - bNumber;
//         });

//         // Iterasi setiap slot dalam history yang sudah terurut
//         sortedSlots.forEach((slot) => {
//             const slotHistory = historyData[slot];
//             const occupiedCount = countOccupiedSlots(slotHistory);

//             const slotHistoryElement = document.createElement('div');
//             slotHistoryElement.style.marginBottom = '10px';
//             slotHistoryElement.style.padding = '8px';
//             slotHistoryElement.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
//             slotHistoryElement.style.borderRadius = '8px';
//             slotHistoryElement.style.transition = 'background-color 0.3s ease';
//             slotHistoryElement.style.cursor = 'pointer';

//             slotHistoryElement.innerHTML = `
//                 <strong>${slot.replace('_', ' ')}</strong>: ${occupiedCount} kali terisi dalam 12 jam terakhir
//             `;

//             slotHistoryElement.addEventListener('mouseover', () => {
//                 slotHistoryElement.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
//             });

//             slotHistoryElement.addEventListener('mouseout', () => {
//                 slotHistoryElement.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
//             });

//             historyContainer.appendChild(slotHistoryElement);
//         });
//     } else {
//         historyContainer.innerHTML = '<p style="text-align: center; color: #ccc;">Tidak ada data history.</p>';
//     }
// }
