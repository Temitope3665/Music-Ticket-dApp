// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract ShowsMarketPlace {
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
        bool is_sold_out;
    }

     // mapping that holds all shows by their IDs
    mapping(uint256 => Show) internal shows;

    event ShowCreated(
    uint256 id,
    address owner,
    string artist_name,
    string show_title,
    string show_date,
    string show_cover_img,
    string location,
    uint256 price,
    uint256 capacity
);

event ShowUpdated(
    uint256 id,
    address owner,
    string artist_name,
    string show_title,
    string show_date,
    string show_cover_img,
    string location,
    uint256 price,
    uint256 capacity
);

event ShowRemoved(
    uint256 id
    );

event TicketBooked(
    uint256 id, address buyer, uint256 amount
    );


    // check if a new show created is valid
    modifier isIdValid(uint256 _id) {
        require(_id < totalShows, "ID not valid!, show has not been created");
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
    ) public {
    require(bytes(_artist_name).length > 0, "Artist name cannot be empty");
    require(bytes(_show_title).length > 0, "Show title cannot be empty");
    require(bytes(_show_date).length > 0, "Show date cannot be empty");
    require(bytes(_show_cover_img).length > 0, "Show cover image URL cannot be empty");
    require(bytes(_location).length > 0, "Location cannot be empty");
    require(_capacity > 0, "Capacity must be greater than zero");
    require(_price > 0, "Price must be greater than zero");

        Show memory _newShow = Show(
            totalShows,
            payable(msg.sender),
            block.timestamp,
            _artist_name,
            _show_title,
            _show_date,
            _show_cover_img,
            _location,
            _price,
            _capacity,
            0,
            0,
            false
        );
        shows[totalShows] = _newShow;
        totalShows++;

            emit ShowCreated(
        _newShow.id,
        _newShow.owner,
        _newShow.artist_name,
        _newShow.show_title,
        _newShow.show_date,
        _newShow.show_cover_img,
        _newShow.location,
        _newShow.price,
        _newShow.capacity
    );
    }

    // get the length of total shows
    function getTotalShows() public view returns (uint256) {
        return totalShows;
    }

    // get single show
    // get show by passing the id of the show
    function getShow(uint256 _id)
        public
        view
        isIdValid(_id)
        returns (Show memory)
    {
        return shows[_id];
    }

    // get all shows
    function getAllShows(uint256 _id) public view returns (Show memory) {
        return shows[_id];
    }

    // Update a show
      function updateShow(
        uint256 _id,
        string memory _show_title,
        string memory _artist_name
    ) public returns (bool success) {
        require(shows[_id].owner == msg.sender, "Unauthorized entity");
        require(bytes(_show_title).length > 0, "Title cannot be empty");
        require(bytes(_artist_name).length > 0, "Artist name cannot be empty");
        require(_id < totalShows, "Invalid show ID");
        require(shows[_id].owner == msg.sender, "Unauthorized entity");

        shows[_id].show_title = _show_title;
        shows[_id].artist_name = _artist_name;
        shows[_id].created_at = block.timestamp;
        return true;

            emit ShowUpdated(
        _id,
        shows[_id].owner,
        _artist_name,
        _show_title,
        shows[_id].show_date,
        shows[_id].show_cover_img,
        shows[_id].location,
        shows[_id].price,
        shows[_id].capacity
    );
    }

    // remove a show
     function removeShow(uint256 _id) public {
        require(shows[_id].number_of_participant < 1, "Sorry, you can not delete this show");
        require(_id < totalShows, "Invalid show ID");
        require(shows[_id].number_of_participant < 1, "Cannot delete show with participants");

        delete shows[_id];

            emit ShowRemoved(_id);

    }

    // book a show
   function bookTicket(uint256 _id) public payable {
        Show storage _show = shows[_id];
        require(_show.number_of_participant < _show.capacity, "Show is sold out");
        require(_show.is_sold_out == false, "Campaign has ended");
        require(msg.sender != _show.owner, "You cannot donate to your own campaign");
        require(msg.value > 0, "Amount must be greater than 0!");
        _show.number_of_participant++;
        _show.total_sold += msg.value;

            emit TicketBooked(_id, msg.sender, msg.value);

    }
        
    
}
