using Microsoft.AspNetCore.Mvc;
using salmpledv2_backend.Services;
using salmpledv2_backend.Models.DTOS;
using Microsoft.AspNetCore.Authorization;
namespace salmpledv2_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{

    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("PostRegisterUser")]
    [Authorize]
    public async Task<IActionResult> PostRegisterUser([FromBody] PostRegisterUserDTO newUser)
    {
        return Ok(await _userService.PostRegisterUser(newUser));
    }

    [HttpPost("claims")]
    public IActionResult Claims()
    {
        return Ok(User.Claims.Select(c =>
            new
            {
                c.Type,
                c.Value
            }));
    }

    [HttpPost("UserSearch")]
    public async Task<IActionResult> UserSearch([FromBody] KeywordDTO keyword)
    {
        return Ok(await _userService.UserSearch(keyword));
    }

    [HttpPost("AddCollab")]
    public async Task<IActionResult> AddCollab([FromBody] AddCollabDTO addCollabDTO)
    {
        return Ok(await _userService.AddCollab(addCollabDTO));
    }


}
