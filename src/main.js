import Web3 from 'web3'; // Import the Web3 library for interacting with the Ethereum blockchain
import { newKitFromWeb3 } from '@celo/contractkit'; // Import the Celo ContractKit for working with Celo contracts
import BigNumber from "bignumber.js"; // Import BigNumber library for handling large numbers
import marketplaceAbi from '../contract/marketplace.abi.json'; // Import the ABI (Application Binary Interface) for the marketplace contract
import moment from 'moment'; // Import the Moment library for working with dates and times
import erc20Abi from "../contract/erc20.abi.json"; // Import the ABI for the ERC20 token contract

const ERC20_DECIMALS = 18; // Define the number of decimal places for the ERC20 token
const ContractAddress = "0xB2750cba91b1E21E22fB5d26af2876F8c46EAd98"; // Define the address of the marketplace contract
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Define the address of the cUSD (Celo USD) token contract

let kit; // Initialize a variable to hold the Celo ContractKit instance
let contract; // Initialize a variable to hold the marketplace contract instance
let shows = []; // Initialize an array to store the list of shows
let isEdited = false; // Initialize a boolean variable to track if a ticket has beeen edited

// Function to connect to Celo wallet
const connectCeloWallet = async function () {
    if (window.celo) { // Check if the Celo extension wallet is available
        notification("⚠️ Please approve this DApp to use it."); // Display a notification to approve the DApp
        try {
            await window.celo.enable(); // Enable the Celo extension wallet
            notification("⚠️ Loading..."); // Display a notification for loading

            const web3 = new Web3(window.celo); // Create a new Web3 instance using the Celo provider
            kit = newKitFromWeb3(web3); // Create a new ContractKit instance from the Web3 instance

            const accounts = await kit.web3.eth.getAccounts(); // Get the accounts associated with the Celo wallet
            kit.defaultAccount = accounts[0]; // Set the default account to the first account in the list

            contract = new kit.web3.eth.Contract(marketplaceAbi, ContractAddress); // Create a new contract instance for the marketplace contract

            // Function to get the list of shows from the marketplace contract
            const getShows = async function() {
                const _showsLength = await contract.methods.totalShows().call(); // Get the total number of shows from the contract
                const _shows = []; // Initialize an array to store the shows
                for (let i = 0; i < _showsLength; i++) {
                    let _show = new Promise(async (resolve, reject) => {
                        let p = await contract.methods.getAllShows(i).call(); // Get the details of a show from the contract
                        resolve({
                            index: i,
                            owner: p[1],
                            artist_name: p[3],
                            show_title: p[4],
                            price: kit.web3.utils.fromWei(p[8]), // Convert the price from wei to cUSD
                            show_date: p[5],
                            show_cover_img: p[6],
                            location: p[7],
                            capacity: p[9],
                            number_of_participant: p[10],
                    sold: kit.web3.utils.fromWei(p[10]),
                  })
                })
                _shows.push(_show)
            }
            shows = await Promise.all(_shows)
              renderShows()
        }
        getShows()
            
        notificationOff()
      } catch (error) {
        notification(`⚠️ ${error.message}.`)
      }
    } else {
      notification("⚠️ Please install the CeloExtensionWallet.")
    }
  }

  async function approve(_price) {
    const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)
    
    const result = await cUSDContract.methods
      .approve(ContractAddress, _price)
      .send({ from: kit.defaultAccount })
    return result
  }

  const web3 = new Web3(window.celo)
  kit = newKitFromWeb3(web3)

  const accounts = kit.web3.eth.getAccounts()
  kit.defaultAccount = accounts[0]
  contract = new kit.web3.eth.Contract(marketplaceAbi, ContractAddress);

  // Edit ticket here  
  document.querySelector("#showmarketplace").addEventListener("click", async (e) => {
    isEdited = true;
    if (e.target.className.includes("editTicket")) {
        const index = e.target.id
            const show = await contract.methods.getShow(index).call()
            document.getElementById("showId").value = show[0],
            document.getElementById("artistName").value = show[3],
            document.getElementById("newShowTitleName").value = show[4],
            document.getElementById("dateOfShow").value = show[5],
            document.getElementById("bannerArt").value = show[6],
            document.getElementById("location").value = show[7],
            document.getElementById("capacity").value = show[9],
            document.getElementById("ticketPrice").value = show[8],

            // Disable field
            document.getElementById("capacity").disabled = true,
            document.getElementById("dateOfShow").disabled = true,
            document.getElementById("capacity").disabled = true,
            document.getElementById("bannerArt").disabled = true,
            document.getElementById("ticketPrice").disabled = true,
            document.getElementById("location").disabled = true

            document.getElementById("newShowBtn").textContent = "Edit"
            document.getElementById("newShowBtn").id = "editShowBtn"
        
            document.getElementById("editShowBtn").addEventListener("click", async (e) => {
                if (document.getElementById("editShowBtn").id === "editShowBtn") {
                    const params = [
                    Number(document.getElementById("showId").value),
                    document.getElementById("newShowTitleName").value,
                    document.getElementById("artistName").value,
                    ]
                    notification(`⌛ Editing "${params[1]}"...`)
                    try {
                    await contract.methods
                        .updateShow(...params)
                        .send({ from: kit.defaultAccount })
                    } catch (error) {
                    notification(`⚠️ ${error}.`)
                    }
                    notification(`🎉 You have successfully edited ${params[1]}.`)
                    await getShows()
                    notificationOff()
                }
            })
          }
})

  document.querySelector("#addModalAgain").addEventListener("click", async (e) => {
    if (isEdited === false) {
        document.querySelector("#newShowBtn").addEventListener("click", async (e) => {
            if (document.getElementById("newShowBtn").id === "newShowBtn") {
                const params = [
                    document.getElementById("artistName").value,
                    document.getElementById("newShowTitleName").value,
                    document.getElementById("dateOfShow").value,
                    document.getElementById("bannerArt").value,
                    document.getElementById("location").value,
                    document.getElementById("capacity").value,
                    kit.web3.utils.toWei(document.getElementById("ticketPrice").value),
                  ]
                  notification(`⌛ Adding ${params[1]} show...`)
                  try {
                    const result = await contract.methods
                      .createShow(...params)
                      .send({ from: kit.defaultAccount })
                      notification(`🎉 You successfully added ${params[1]} show.`)
                  } catch (error) {
                    notification(`⚠️ ${error}.`)
                  }
                  await getShows()
            }
        });
    } else {
        document.getElementById("artistName").value = '',
        document.getElementById("newShowTitleName").value = '',
        document.getElementById("dateOfShow").value = '',
        document.getElementById("bannerArt").value = '',
        document.getElementById("location").value = '',
        document.getElementById("capacity").value = '',
        new BigNumber(document.getElementById("ticketPrice").value = '')
        .shiftedBy(ERC20_DECIMALS)
        .toString()
        document.getElementById("editShowBtn").textContent = "Add Show"
        document.getElementById("editShowBtn").id = "newShowBtn"

        // Enable input field 
        document.getElementById("capacity").disabled = false;
        document.getElementById("artistName").disabled = false;
        document.getElementById("capacity").disabled = false;
        document.getElementById("bannerArt").disabled = false;
        document.getElementById("ticketPrice").disabled = false;
        document.getElementById("location").disabled = false;

        document.querySelector("#newShowBtn").addEventListener("click", async (e) => {
            if (document.getElementById("newShowBtn").id === "newShowBtn") {
                const params = [
                    document.getElementById("artistName").value,
                    document.getElementById("newShowTitleName").value,
                    document.getElementById("dateOfShow").value,
                    document.getElementById("bannerArt").value,
                    document.getElementById("location").value,
                    document.getElementById("capacity").value,
                    document.getElementById("ticketPrice").value,
                  ]
                  notification(`⌛ Adding ${params[1]} show...`)
                  try {
                    const result = await contract.methods
                      .createShow(...params)
                      .send({ from: kit.defaultAccount })
                  } catch (error) {
                    notification(`⚠️ ${error}.`)
                  }
                  notification(`🎉 You successfully added ${params[1]} show.`)
                  await getShows()
            }
        });
    }
  })

// get balance
const getBalance = async function () {
    const getBalance = await kit.getTotalBalance(kit.defaultAccount)
    const getCeloBalance = getBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
    document.querySelector("#balance").textContent = getCeloBalance;
};

// Get all shows
const getShows = async function() {
    const _showsLength = await contract.methods.totalShows().call()
    const _shows = []
    for (let i = 0; i < _showsLength; i++) {
        let _show = new Promise(async (resolve, reject) => {
          let p = await contract.methods.getAllShows(i).call()
          resolve({
            index: i,
            owner: p[1],
            artist_name: p[3],
            show_title: p[4],
            price: kit.web3.utils.fromWei(p[8]),
            show_date: p[5],
            show_cover_img: p[6],
            location: p[7],
            capacity: p[9],
            number_of_participant: p[10],
            sold: kit.web3.utils.fromWei(p[11]),
          })
        })
        _shows.push(_show)
      }
      shows = await Promise.all(_shows)
      renderShows()
}

// render show
const renderShows = function () {
  document.getElementById("showmarketplace").innerHTML = "";
  shows.filter((show) => show.owner !== "0x0000000000000000000000000000000000000000").forEach((_show) => {
        const newDiv = document.createElement("div");
        newDiv.className = "col-md-4";
        newDiv.innerHTML = showCard(_show);
        document.getElementById("showmarketplace").appendChild(newDiv);
      });
};

// if there is no show created yet
const renderEmpytyShow = function () {
    const newDiv = document.createElement("div");
    newDiv.innerHTML = `
        <div class="alert alert-warning sticky-top mt-2">
            <span class="card-text">There is no show available.</span>
            <span>Click <a class="text-primary" data-bs-toggle="modal"
            data-bs-target="#addModal" style="cursor: pointer">here</a> to add a show</span>
        </div>
    `;
    document.getElementById("showmarketplace").appendChild(newDiv);
}

// delete show
document.querySelector("#showmarketplace").addEventListener("click", async (e) => {
    if(e.target.className.includes("deleteTicket")) {
        const index = e.target.id;
        if(shows[index].owner === kit.defaultAccount) {
          notification(`⚠️ Deleting ${shows[index].show_title} show...`);
          try {
              const result = await contract.methods
              .removeShow(index)
              .send({ from: kit.defaultAccount });
            } catch (error) {
              notification(`⚠️ ${error}.`)
            }
            notification(`🎉 You've deleted ${shows[index].show_title} show.`)
            notificationOff();
            await getShows();
            await getBalance();
          } else {
            notification(`⚠️ Only the owner of ${shows[index].show_title} can delete this show`);
            setTimeout(() => {
              notificationOff();
            }, 2000);
          }
    } else if (e.target.className.includes("nDelete")) {
      const index = e.target.id;
      if (shows[index].owner !== kit.defaultAccount) {
        notification(`⚠️ Only the owner of ${shows[index].show_title} can delete this show`);
        setTimeout(() => {
          notificationOff();
        }, 2000);
      } else {
        notification(`⚠️ Ticket can not be deleted because it has participants`);
        setTimeout(() => {
          notificationOff();
        }, 2000);
      }
    }
});

// NB:
// this renders all the shows in a card
// edit show is removed if user is not the owner/creator
// book ticket button faded out if ticket is sold out and the cta changes
// Not sold out text changes to 'sold out' if ticket is sold out
// Delete button does not work if user is not the owner/creator
const showCard = (show_) => {
  const isSoldOut = show_.capacity === show_.number_of_participant || show_.capacity < show_.number_of_participant;
  return `
    <div class="card mb-4" style="min-height: 650px" id="show-${show_.index}">
        <img class="card-img-top" src="${show_.show_cover_img}" alt="...">
        ${show_.owner == kit.defaultAccount ? `
        ${isSoldOut ? '' : `
        <div class="position-absolute editTicket top-0 start-0 bg-success mt-4 px-2 py-1 rounded-end" style="cursor: pointer" data-bs-toggle="modal"
        data-bs-target="#addModal" id=${show_.index}>
        Edit show
        </div>
      `}
        ` : ''}
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${show_.number_of_participant} S/O
        </div>
        <div class="card-body text-left p-4 position-relative">
        <div class="position-absolute ${show_.number_of_participant > 0 ? 'nDelete' : 'deleteTicket'} bottom-0 start-0 bg-danger mt-4 px-2 py-1 rounded-end" style="cursor: pointer; color: white" id=${show_.index}>
        Delete ticket
        </div>
        <div class="translate-middle-y position-absolute top-0">
            ${identiconTemplate(show_.owner)}
            </div>
            <h2 class="card-title fs-4 fw-bold mt-2">${show_.show_title} | ${show_.artist_name}</h2>
            <i class="bi bi-calendar4-event"></i>
            <span class="card-text" style="min-height: 82px">
            ${moment(show_.show_date).format('llll') === 'Invalid date' ? show_.show_date : moment(show_.show_date).format('llll')}             
            </span>
            <p class="card-text mt-4">
            <i class="bi bi-geo-alt-fill"></i>
            <span>${show_.location}</span>
            </p>
            <p class="card-text">
            <i class="bi bi-people-fill"></i>
            <span>${show_.capacity} capacity | <span class="text-danger">${isSoldOut ? 'Sold out' : 'Not sold out'}</span></span>
            </p>
            <p class="card-text">
            <i class="bi bi-tags-fill"></i>
            <span>${show_.price} cUSD</span>
            </p>
            <div class="d-grid gap-2" id="bookButton" style="opacity: ${isSoldOut ? '0.5' : '1'};"}>
              <a class="btn btn-lg ${isSoldOut ? 'disableTicket btn-primary' : 'bookTicket  btn-outline-primary'} fs-6 px-3 py-2" id=${
                  show_.index
              }>
                  ${isSoldOut ? 'Ticket fully booked' : 'Book ticket'}
              </a>
            </div>
        </div>
    </div>
    `;
};

function identiconTemplate(_address) {
    const icon = blockies
      .create({
        seed: _address,
        size: 8,
        scale: 16,
      })
      .toDataURL()
  
    return `
    <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
      <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
          target="_blank">
          <img src="${icon}" width="48" alt="${_address}">
      </a>
    </div>
    `
  }

// notification
  function notification(_text) {
    document.querySelector(".alert").style.display = "block"
    document.querySelector("#notification").textContent = _text
  }
  
  function notificationOff() {
    document.querySelector(".alert").style.display = "none"
  }

  window.addEventListener("load", async () => {
    notification("⌛ Loading...")
    await connectCeloWallet();
    await getBalance();
    shows.length ? await getShows() : renderEmpytyShow();
    notificationOff();
  })

  document.querySelector("#showmarketplace").addEventListener("click", async (e) => {
    if(e.target.className.includes("bookTicket")) {
      const index = e.target.id
      if(shows[index].owner !== kit.defaultAccount) {
        notification(`🎉 Booking ${shows[index].show_title} show...`);
        try {
          await approve(kit.web3.utils.toWei(shows[index].price))
        } catch (error) {
          notification(`⚠️ ${error}.`)
        }
        try {
          const result = await contract.methods
          .bookTicket(index)
          .send({ from: kit.defaultAccount });
          notification(`🎉 You've successfully booked ${shows[index].show_title} show.`)
          const printContents = document.getElementById(`show-${index}`).innerHTML;
          const originalContents = document.body.innerHTML;
          document.body.innerHTML = printContents;
          window.print();
          document.body.innerHTML = originalContents;
        } catch (error) {
          notification(`⚠️ ${error}.`)
        }
        notificationOff();
        await getShows();
        await getBalance();
      } else {
        notification(`⚠️ Owner can not book their own shows`);
        setTimeout(() => {
          notificationOff();
        }, 2000);
      }
    } else if (e.target.className.includes("disableTicket")) {
      notification(`⚠️ Sorry, show is sold out...`);
      setTimeout(() => {
        notificationOff();
      }, 2000);
    }
  })
