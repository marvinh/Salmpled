


using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace salmpledv2_backend.Services
{
    public class UserService : IUserService
    {
        private readonly MyContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly IMapper _mapper;

        public UserService(MyContext context, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }
        public async Task<ServiceResponse<List<GetUserDTO>>> UserSearch(KeywordDTO keywordDTO)
        {
            ServiceResponse<List<GetUserDTO>> res = new ServiceResponse<List<GetUserDTO>>();
            try
            {
                var list = await _context.Users.Where(s => s.Username.Contains(keywordDTO.Keyword)).Take(50).OrderBy(s => s.Username).ToListAsync();

                res.Result = _mapper.Map<List<GetUserDTO>>(list);
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;

        }
        public async Task<ServiceResponse<string>> PostRegisterUser(PostRegisterUserDTO newUser)
        {

            ServiceResponse<string> res = new ServiceResponse<string>();

            try
            {
                User? user = await _context.Users.FirstOrDefaultAsync(i => i.SubId == newUser.SubId);
                if (user != null)
                {
                    res.Result = "Already Registered";
                }
                else
                {
                    await _context.Users.AddAsync(
                        new User
                        {
                            SubId = newUser.SubId,
                            Email = newUser.Email,
                            Username = newUser.Username,
                        }
                    );
                    await _context.SaveChangesAsync();
                    res.Result = $"Registered {newUser.Username}";
                }
            }
            catch (Exception ex)
            {
                res.Err = ex.Message;
            }

            return res;

        }

        public async Task<ServiceResponse<string>> AddCollab(AddCollabDTO addCollabDTO)
        {
            ServiceResponse<string> res = new ServiceResponse<string>();
            try
            {
                var pack = await _context.Packs.Where(p => p.Id == addCollabDTO.PackId).Include(p => p.Group).SingleAsync();
                var groupId = pack.Group == null ? Guid.NewGuid() : pack.GroupId;
                if (pack.Group == null)
                {

                    await _context.AddAsync( new Group {
                        Id = groupId.GetValueOrDefault(),
                    });
                    pack.GroupId = groupId;
                    
                    await _context.SaveChangesAsync();
                }
                var collabs = new List<UserGroup>();
                foreach (var userId in addCollabDTO.UserIds)
                {
                    collabs.Add(new UserGroup
                    {
                        UserId = userId,
                        GroupId = groupId.GetValueOrDefault(),
                    });
                }

                await _context.AddRangeAsync(collabs);
                await _context.SaveChangesAsync();


            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;
        }

    }
}