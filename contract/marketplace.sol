// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract ShowsMarketPlace {
    //all events
    event ShowCreated(
        address indexed showOwner,
        uint256 indexed showId,
        uint256 indexed showPrice,
        uint256 showCapacity
    );
    event ShowUpdated(address indexed showOwner, uint256 indexed showId);
    event TicketBooked(
        address indexed buyer,
        uint256 indexed showId,
        uint256 indexed amountPaid
    );

    // this holds all the shows created
    uint256 public totalShows;

    struct Show {
        uint256 id;
        address payable owner;
        uint256 created_at;
        string artist_name;
        string show_title;
        string show_date;
        string show_cover_img;
        string location;
        uint256 price;
        uint256 capacity;
        uint256 number_of_participant;
        uint256 total_sold;
        bool is_active;
    }

    // array that holds all shows
    Show[] internal show;

    // check if a new show created is valid
    modifier isIdValid(uint256 _id) {
        require(_id < totalShows, "ID not valid!, show has not been created");
        _;
    }
    modifier isGreaterThanZero(uint256 _amount) {
        require(_amount > 0, "amount must be greater than zero");
        _;
    }

    // create show ticket
    function createShow(
        string memory _artist_name,
        string memory _show_title,
        string memory _show_date,
        string memory _show_cover_img,
        string memory _location,
        uint256 _capacity,
        uint256 _price
    ) public isGreaterThanZero(_capacity) isGreaterThanZero(_price) {
        totalShows++; // Increment totalShows
        Show memory _newShow = Show(
            totalShows, // Incremented totalShows is used as the ID
            payable(msg.sender),
            block.timestamp,
            _artist_name,
            _show_title,
            _show_date,
            _show_cover_img,
            _location,
            _price,
            _capacity, //capacity should measure the total number of participants a show should take
            0,
            0,
            true //setting as true here indicates that show is active
        );
        show.push(_newShow);

        //emit event
        emit ShowCreated(msg.sender, totalShows, _price, _capacity);
    }

    // get single show
    // get show by passing the id of the show
    function getShow(
        uint256 _id
    ) public view isIdValid(_id) returns (Show memory) {
        require(_id > 0 && _id <= totalShows, "Invalid show ID");
     return show[_id - 1];

    }

    // get all shows
    function getAllShows(uint256 _id) public view returns (Show memory) {
        return show[_id];
    }

    // Update a show
    function updateShow(
        uint256 _id,
        string memory _show_title,
        string memory _artist_name
    ) public returns (bool success) {
        require(show[_id].owner == msg.sender, "Unauthorized entity");
        require(bytes(_show_title).length > 0, "Title cannot be empty");
        require(bytes(_artist_name).length > 0, "Artist name cannot be empty");
        require(
            show[_id].is_active == true,
            "You cannot update an inactive show"
        );
        for (uint256 i = 0; i < show.length; i++) {
            if (show[i].id == _id) {
                show[i].show_title = _show_title;
                show[i].artist_name = _artist_name;
                show[i].created_at = block.timestamp;
            }
        }

        //emit events
        emit ShowUpdated(msg.sender, _id);
        return true;
    }

    // remove a show
    function removeShow(uint256 _id) public isIdValid(_id) {
        require(
            show[_id].number_of_participant < 1,
            "Sorry, you can not delete this show"
        );
        require(show[_id].owner == msg.sender, "Only owner can remove a show");
        //Deleting creates gaps in the mappings, instead update bool that monitors
        // delete show[_id];
        show[_id].is_active = false;
    }

    // book a show
    function bookTicket(uint256 _id) public payable isIdValid(_id) {
     Show storage s = show[_id - 1];
     require(msg.value > 0, "Amount must be greater than 0!");
     require(s.is_active == true, "Show has ended");
     require(s.number_of_participant < s.capacity, "Show has reached its capacity");
     s.number_of_participant++;
     s.total_sold += msg.value;
     //emit events
     emit TicketBooked(msg.sender, _id, msg.value);
 }

}
