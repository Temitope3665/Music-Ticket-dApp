import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import marketplaceAbi from '../contract/marketplace.abi.json'
import moment from 'moment'
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18;
const ContractAddress = "0x45613d14A7fD2e24344a05ca7a08701C95b4a035";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit;
let contract;
let shows = [];
let isEdited = false;

// Connect to celo wallet
const connectCeloWallet = async function () {
    if (window.celo) {
        notification("⚠️ Please approve this DApp to use it.")
      try {
        await window.celo.enable()
        notification("⚠️ Loading...")

        const web3 = new Web3(window.celo)
        kit = newKitFromWeb3(web3)

        const accounts = await kit.web3.eth.getAccounts()
        kit.defaultAccount = accounts[0]

        contract = new kit.web3.eth.Contract(marketplaceAbi, ContractAddress)

        const getShows = async function() {
            const _showsLength = await contract.methods.getTotalShows().call()
            const _shows = []
            for (let i = 0; i < _showsLength; i++) {
                let _show = new Promise(async (resolve, reject) => {
                  let p = await contract.methods.getAllShows(i).call()
                  resolve({
                    index: i,
                    owner: p[1],
                    artist_name: p[3],
                    show_title: p[4],
                    price: new BigNumber(p[8]),
                    show_date: p[5],
                    show_cover_img: p[6],
                    location: p[7],
                    capacity: p[9],
                    number_of_participant: p[7],
                    sold: p[10],
                  })
                })
                _shows.push(_show)
            }
            shows = await Promise.all(_shows)
              renderShows()
        }
            
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
            document.getElementById("artistName").disabled = true,
            document.getElementById("capacity").disabled = true,
            document.getElementById("bannerArt").disabled = true,
            document.getElementById("ticketPrice").disabled = true,
            document.getElementById("location").disabled = true

            document.getElementById("newShowBtn").textContent = "Edit"
            document.getElementById("newShowBtn").id = "editShowBtn"
        }
            document.getElementById("editShowBtn").addEventListener("click", async (e) => {
                if (document.getElementById("editShowBtn").id === "editShowBtn") {
                    const params = [
                    document.getElementById("showId").value,
                    document.getElementById("newShowTitleName").value,
                    document.getElementById("dateOfShow").value,
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
    const getCeloBalance = getBalance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2)
    document.querySelector("#balance").textContent = getCeloBalance;
};

// Get all shows
const getShows = async function() {
    const _showsLength = await contract.methods.getTotalShows().call()
    const _shows = []
    for (let i = 0; i < _showsLength; i++) {
        let _show = new Promise(async (resolve, reject) => {
          let p = await contract.methods.getAllShows(i).call()
          resolve({
            index: i,
            owner: p[1],
            artist_name: p[3],
            show_title: p[4],
            price: new BigNumber(p[8]),
            show_date: p[5],
            show_cover_img: p[6],
            location: p[7],
            capacity: p[9],
            number_of_participant: p[10],
            sold: p[11],
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
  shows.filter((show) => show.owner !== "0x0000000000000000000000000000000000000000").forEach((_product) => {
        const newDiv = document.createElement("div");
        newDiv.className = "col-md-4";
        newDiv.innerHTML = showCard(_product);
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
    }
})

const showCard = (show_) => {
  return `
    <div class="card mb-4" style="min-height: 650px">
        <img class="card-img-top" src="${show_.show_cover_img}" alt="...">
        <div class="position-absolute editTicket top-0 start-0 bg-success mt-4 px-2 py-1 rounded-end" style="cursor: pointer" data-bs-toggle="modal"
        data-bs-target="#addModal" id=${show_.index}>
        Edit show
        </div>
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${show_.sold} S/O
        </div>
        <div class="card-body text-left p-4 position-relative">
        <div class="position-absolute deleteTicket bottom-0 start-0 bg-danger mt-4 px-2 py-1 rounded-end" style="cursor: pointer; color: white" id=${show_.index}>
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
            <span>${show_.capacity} capacity | <span class="text-danger">Not sold out</span></span>
            </p>
            <p class="card-text">
            <i class="bi bi-tags-fill"></i>
            <span>${show_.price} CELO</span>
            </p>
            <div class="d-grid gap-2">
            <a class="btn btn-lg btn-outline-primary bookTicket fs-6 px-3 py-2" id=${
                show_.index
            }>
                Book a ticket
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
    localStorage.setItem('edit', false);
    notification("⌛ Loading...")
    await connectCeloWallet();
    await getBalance();
    shows.length ? await getShows() : renderEmpytyShow();
    notificationOff();
  })

  document.querySelector("#showmarketplace").addEventListener("click", async (e) => {
    if(e.target.className.includes("bookTicket")) {
      const index = e.target.id
      const amount = shows[index].price;
      notification(`🎉 Booking ${shows[index].show_title} show...`);
      try {
        await approve(shows[index].price)
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      try {
        const result = await contract.methods
        .bookTicket(index)
        .send({ from: kit.defaultAccount, value: kit.web3.utils.toWei(amount.toString()) });
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      notification(`🎉 You've successfully booked ${shows[index].show_title} show.`)
      notificationOff();
      await getShows();
      await getBalance();
    }
  })