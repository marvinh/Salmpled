using Microsoft.AspNetCore.Mvc;
using salmpledv2_backend.Services;
using salmpledv2_backend.Models.DTOS;
using Microsoft.AspNetCore.Authorization;
namespace salmpledv2_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PackController : ControllerBase
{

    private readonly IPackService _packService;

    public PackController(IPackService packService)
    {
        _packService = packService;
    }

    [HttpPost("CreatePack")]
    [Authorize]
    public async Task<IActionResult> CreatePack([FromBody] CreatePackDTO newPack)
    {
        return Ok(await _packService.CreatePack(newPack));
    }

    [HttpPost("NameAvailable")]
    [Authorize]
    public async Task<IActionResult> NameAvailable([FromBody] CreatePackDTO newPack)
    {
        return Ok(await _packService.NameAvailable(newPack.Name));
    }

    [HttpPost("GetPack")]
    public async Task<IActionResult> GetPack([FromBody] PackSlugDTO dto)
    {
        return Ok(await _packService.GetPackFromPackSlugDTO(dto));
    }

    [HttpPost("History")]
    
    public async Task<IActionResult> History([FromBody] PackSlugDTO dto)
    {
        return Ok(await _packService.History(dto));
    }

    [HttpPost("HistoryOptions")]
    public async Task<IActionResult> HistoryOptions([FromBody] PackSlugDTO dto)
    {
        return Ok(await _packService.HistoryOptions(dto));
    }

    [HttpPost("Compare")]
     public async Task<IActionResult> Compare([FromBody] PackSlugDTO dto)
    {
        return Ok(await _packService.Compare(dto));
    }

     [HttpPost("YourSamplePacks")]
     [Authorize]
     public async Task<IActionResult> YourSamplePacks()
    {
        return Ok(await _packService.YourSamplePacks());
    }

    [HttpPost("CollabPacks")]
    [Authorize]
    public async Task<IActionResult> CollabPacks() {
        return Ok(await _packService.CollabPacks());
    }



    




}
