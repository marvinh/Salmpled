using Microsoft.AspNetCore.Mvc;
using salmpledv2_backend.Services;
using salmpledv2_backend.Models.DTOS;
using Microsoft.AspNetCore.Authorization;
namespace salmpledv2_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagController : ControllerBase
{

    private readonly ITagService _TagService;

    public TagController(ITagService TagService)
    {
        _TagService = TagService;
    }

    [HttpPost("CreateTag")]
    [Authorize]
    public async Task<IActionResult> CreateTag([FromBody] TagDTO TagDTO)
    {
        return Ok(await _TagService.CreateTag(TagDTO));
    }

    [HttpPost("TagOptions")]
    public async Task<IActionResult> TagOptions([FromBody] TagDTO TagDTO)
    {
        return Ok(await _TagService.TagOptions(TagDTO));
    }

   


}
